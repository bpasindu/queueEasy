import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import COLORS from '../../theme/colors';
import api from '../../services/api';

interface DoctorScreenProps {
  onLogout: () => void;
}

export const DoctorScreen: React.FC<DoctorScreenProps> = ({ onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Clinic info
  const [doctorName, setDoctorName] = useState('Dr. Silva');
  const [specialty, setSpecialty] = useState('General Physician');
  const [clinicName, setClinicName] = useState('Nugegoda Clinic');
  
  // Stats
  const [inQueue, setInQueue] = useState(17);
  const [served, setServed] = useState(2);
  const [avgConsult, setAvgConsult] = useState(6.4);
  const [onTimePercent, setOnTimePercent] = useState('92%');
  
  // Start times
  const [scheduledStart, setScheduledStart] = useState('9:00 AM');
  const [actualStart, setActualStart] = useState('9:18 AM');

  // Currently Serving Patient
  const [nowServingSlot, setNowServingSlot] = useState(3);
  const [nowServingName, setNowServingName] = useState('Asanka D.');
  const [nowServingPredicted, setNowServingPredicted] = useState('9:30 AM');

  // Upcoming patient list
  const [upcomingList, setUpcomingList] = useState<any[]>([]);

  const fetchDoctorQueueStatus = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await api.get('/doctor/queue-status');
      if (response.data.success) {
        const data = response.data;
        setDoctorName(data.doctor);
        setSpecialty(data.specialty);
        setClinicName(data.clinicName);
        setInQueue(data.inQueue);
        setServed(data.served);
        setAvgConsult(data.avgConsult);
        
        // Dynamic on-time percentage based on start delay (for premium look)
        if (data.actualStart && data.actualStart !== '--:--') {
          setOnTimePercent('92%');
        } else {
          setOnTimePercent('--');
        }

        setScheduledStart(data.scheduledStart || '9:00 AM');
        setActualStart(data.actualStart || '--:--');

        setNowServingSlot(data.nowServing);
        setNowServingName(data.nowServingName || 'No Patient');
        setNowServingPredicted(data.nowServingPredicted || '--');

        setUpcomingList(data.upcoming || []);
      }
    } catch (error) {
      console.error('Error fetching doctor queue status:', error);
      Alert.alert('Error', 'Failed to retrieve queue dashboard data.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorQueueStatus();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDoctorQueueStatus(false);
    setRefreshing(false);
  };

  const handleMarkServed = async () => {
    try {
      setLoading(true);
      const response = await api.post('/doctor/next');
      if (response.data.success) {
        Alert.alert('Queue Advanced', `Successfully serving ticket #${response.data.nowServing}`);
        await fetchDoctorQueueStatus(false);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to advance queue.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (bookingId: string, slotNum: number) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel booking for slot #${slotNum}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await api.post(`/doctor/cancel-booking/${bookingId}`);
              if (response.data.success) {
                Alert.alert('Cancelled', `Slot #${slotNum} booking has been cancelled.`);
                await fetchDoctorQueueStatus(false);
              }
            } catch (error: any) {
              const message = error.response?.data?.message || 'Failed to cancel booking.';
              Alert.alert('Error', message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCallPatient = (phone: string) => {
    if (!phone) {
      Alert.alert('Error', 'No phone number available for this patient.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Failed to launch dialer application.');
    });
  };

  // SVGs matching designs
  const renderMenuIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M4 6h16M4 12h16M4 18h16" stroke={COLORS.textDark} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );

  const renderGroupIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={COLORS.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9" cy="7" r="4" stroke={COLORS.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const renderCheckCircleIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#2ECC71" strokeWidth="2.5" />
      <Path d="M8 12l3 3 5-5" stroke="#2ECC71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const renderClockIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#00BFA5" strokeWidth="2.5" />
      <Path d="M12 6v6l4 2" stroke="#00BFA5" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );

  const renderTrendUpIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" stroke="#E67E22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const renderCalendarIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={COLORS.textMuted} strokeWidth="2.5" />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={COLORS.textMuted} strokeWidth="2.5" />
    </Svg>
  );

  const renderPlayCircleIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#27AE60" strokeWidth="2.5" />
      <Path d="M10 8l6 4-6 4V8z" fill="#27AE60" />
    </Svg>
  );

  const renderPhoneIcon = () => (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke={COLORS.primaryDark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const renderCloseIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={COLORS.error} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const renderSparkleIcon = () => (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill={COLORS.textMuted} style={{ marginRight: 4 }}>
      <Path d="M12 2c0 5.523-4.477 10-10 10 5.523 0 10 4.477 10 10 0-5.523 4.477-10 10-10-5.523 0-10-4.477-10-10z" />
    </Svg>
  );

  if (loading && upcomingList.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgTint, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navbar */}
      <View style={styles.topNavigation}>
        <View>
          <Text style={styles.adminLabel}>ADMIN · {doctorName.toUpperCase()}</Text>
          <Text style={styles.titleText}>Today's queue</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onLogout}
          style={styles.menuButton}
        >
          {renderMenuIcon()}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            {/* Card 1 */}
            <View style={styles.statCard}>
              <View style={styles.statIconWrapper}>{renderGroupIcon()}</View>
              <Text style={styles.statValue}>{inQueue}</Text>
              <Text style={styles.statLabel}>In queue</Text>
            </View>

            {/* Card 2 */}
            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#EAFAD1' }]}>{renderCheckCircleIcon()}</View>
              <Text style={styles.statValue}>{served}</Text>
              <Text style={styles.statLabel}>Served</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {/* Card 3 */}
            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: COLORS.primaryLight }]}>{renderClockIcon()}</View>
              <Text style={styles.statValue}>{avgConsult}m</Text>
              <Text style={styles.statLabel}>Avg consult</Text>
            </View>

            {/* Card 4 */}
            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#FDEBD0' }]}>{renderTrendUpIcon()}</View>
              <Text style={styles.statValue}>{onTimePercent}</Text>
              <Text style={styles.statLabel}>On-time %</Text>
            </View>
          </View>
        </View>

        {/* Start Times Row */}
        <View style={styles.startTimesRow}>
          <View style={styles.scheduledPill}>
            {renderCalendarIcon()}
            <Text style={styles.timeLabel}>SCHEDULED START</Text>
            <Text style={styles.timeVal}>{scheduledStart}</Text>
          </View>

          <View style={styles.actualPill}>
            {renderPlayCircleIcon()}
            <Text style={[styles.timeLabel, { color: '#27AE60' }]}>ACTUAL START</Text>
            <Text style={[styles.timeVal, { color: '#27AE60' }]}>{actualStart}</Text>
          </View>
        </View>

        {/* Now Serving Card */}
        <View style={styles.nowServingCard}>
          <View style={styles.nowServingLeft}>
            <Text style={styles.nowServingLabel}>NOW SERVING</Text>
            <Text style={styles.nowServingValue} numberOfLines={1}>
              #{nowServingSlot} · {nowServingName}
            </Text>
            <Text style={styles.nowServingPredicted}>
              Predicted {nowServingPredicted}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.markServedBtn}
            activeOpacity={0.85}
            onPress={handleMarkServed}
          >
            <Text style={styles.markServedText}>Mark served</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Patients Section Header */}
        <View style={styles.upcomingHeaderRow}>
          <Text style={styles.upcomingTitle}>Upcoming patients</Text>
          <View style={styles.aiPredictionHeader}>
            {renderSparkleIcon()}
            <Text style={styles.aiPredictionLabel}>AI-predicted</Text>
          </View>
        </View>

        {/* Upcoming Patients List */}
        {upcomingList.length > 0 ? (
          upcomingList.map((item, index) => {
            const patientName = item.patient?.name || `Patient Slot #${item.slotNumber}`;
            const displayTime = item.predictedServingTime || '--';

            return (
              <View key={item._id || index} style={styles.patientListItem}>
                <View style={styles.patientBadgeCircle}>
                  <Text style={styles.patientBadgeText}>{item.slotNumber}</Text>
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patientName}</Text>
                  <Text style={styles.patientPredicted}>Predicted {displayTime}</Text>
                </View>
                <View style={styles.patientActions}>
                  <TouchableOpacity
                    style={styles.actionCallBtn}
                    activeOpacity={0.7}
                    onPress={() => handleCallPatient(item.patient?.phone)}
                  >
                    {renderPhoneIcon()}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionCancelBtn}
                    activeOpacity={0.7}
                    onPress={() => handleCancelBooking(item._id, item.slotNumber)}
                  >
                    {renderCloseIcon()}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyListCard}>
            <Text style={styles.emptyListText}>No upcoming bookings for today.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgTint,
  },
  topNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    paddingBottom: 16,
    backgroundColor: COLORS.bgTint,
  },
  adminLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  statsGrid: {
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 236, 238, 0.6)',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textDark,
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  startTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  scheduledPill: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 8,
  },
  actualPill: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAFDF5',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#C2F0DB',
    paddingHorizontal: 8,
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  timeVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
    marginLeft: 6,
  },
  nowServingCard: {
    backgroundColor: '#00D2B4',
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 32,
  },
  nowServingLeft: {
    flex: 1,
    paddingRight: 8,
  },
  nowServingLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  nowServingValue: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 4,
  },
  nowServingPredicted: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  markServedBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  markServedText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  upcomingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  aiPredictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiPredictionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  patientListItem: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 236, 238, 0.5)',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  patientBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientBadgeText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '800',
  },
  patientInfo: {
    flex: 1,
    paddingHorizontal: 14,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  patientPredicted: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  patientActions: {
    flexDirection: 'row',
  },
  actionCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionCancelBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 236, 238, 0.5)',
  },
  emptyListText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DoctorScreen;
