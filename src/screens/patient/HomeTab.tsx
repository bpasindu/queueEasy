import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import COLORS from '../../theme/colors';

interface HomeTabProps {
  userName: string;
  activeBooking: {
    _id?: string;
    number: number;
    wait: number;
    predicted: string;
    started: string;
    live: boolean;
    clinic?: {
      doctor: string;
      specialty: string;
      clinic: string;
      currentServing: number;
    };
  } | null;
  clinics: any[];
  onBookSlotPress: () => void;
  onClinicCardPress: (clinic: any) => void;
  onNavigateToNotifications?: () => void;
  onSeeAllPress?: () => void;
  refreshBooking?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  userName,
  activeBooking,
  clinics,
  onBookSlotPress,
  onClinicCardPress,
  onNavigateToNotifications,
  onSeeAllPress,
  refreshBooking,
}) => {
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getGreeting = () => {
    try {
      const colomboHourStr = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: 'numeric',
        hour12: false,
      });
      const hour = parseInt(colomboHourStr, 10);
      if (hour >= 5 && hour < 12) return 'Good morning';
      if (hour >= 12 && hour < 17) return 'Good afternoon';
      if (hour >= 17 && hour < 22) return 'Good evening';
      return 'Good night';
    } catch (e) {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return 'Good morning';
      if (hour >= 12 && hour < 17) return 'Good afternoon';
      if (hour >= 17 && hour < 22) return 'Good evening';
      return 'Good night';
    }
  };
  // Render SVG icons helper functions
  const renderBellIcon = () => (
    <View style={styles.notificationBellContainer}>
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
          stroke={COLORS.white}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M13.73 21a2 2 0 0 1-3.46 0"
          fill={COLORS.white}
        />
      </Svg>
      <View style={styles.bellBadge} />
    </View>
  );

  const renderSparkleIcon = () => (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill={COLORS.white} style={styles.sparkleIcon}>
      <Path d="M12 2c0 5.523-4.477 10-10 10 5.523 0 10 4.477 10 10 0-5.523 4.477-10 10-10-5.523 0-10-4.477-10-10z" />
    </Svg>
  );

  const renderPlayIcon = () => (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={styles.playIcon}>
      <Circle cx="12" cy="12" r="10" stroke={COLORS.white} strokeWidth="2" />
      <Path d="M10 8l6 4-6 4V8z" fill={COLORS.white} />
    </Svg>
  );

  const renderCalendarIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={COLORS.primary} strokeWidth="2" />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={COLORS.primary} strokeWidth="2" />
    </Svg>
  );

  const renderClockIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={COLORS.primary} strokeWidth="2" />
      <Path d="M12 6v6l4 2" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );

  const renderStethoscopeIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M5 3h2M17 3h2" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" />
      <Path d="M6 3v4c0 3.31 2.69 6 6 6s6-2.69 6-6V3" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 13v4" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="12" cy="19" r="3" stroke={COLORS.white} strokeWidth="2" />
    </Svg>
  );

  const renderMapPinIcon = () => (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={styles.pinIcon}>
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={COLORS.textMuted} strokeWidth="2" />
      <Circle cx="12" cy="10" r="3" stroke={COLORS.textMuted} strokeWidth="2" />
    </Svg>
  );

  const renderChevronRight = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path d="M9 5l7 7-7 7" stroke={COLORS.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Curved Header Container */}
      <View style={styles.headerBlock}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.profileNameText}>{userName} 👋</Text>
          </View>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.8} onPress={onNavigateToNotifications}>
            {renderBellIcon()}
          </TouchableOpacity>
        </View>

        {/* Active Booking Card inside Header */}
        {activeBooking ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setIsTrackingModalOpen(true)}
            style={styles.activeBookingCard}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeaderTitle}>
                ACTIVE BOOKING — {activeBooking.clinic?.doctor || 'Doctor'}
              </Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            </View>

            <View style={styles.cardNumbersRow}>
              <View style={styles.cardNumberCol}>
                <Text style={styles.cardNumberLabel}>Your number</Text>
                <Text style={styles.cardNumberText}>#{activeBooking.number}</Text>
              </View>

              <View style={styles.cardEstimateCol}>
                <View style={styles.aiEstimateLabelRow}>
                  {renderSparkleIcon()}
                  <Text style={styles.cardEstimateLabel}>AI estimate</Text>
                </View>
                <Text style={styles.cardEstimateValue}>~ {activeBooking.wait} min</Text>
              </View>
            </View>

            <View style={styles.cardBottomRow}>
              <Text style={styles.cardBottomLeft}>
                Predicted {activeBooking.predicted}
              </Text>
              <View style={styles.cardBottomRightRow}>
                {renderPlayIcon()}
                <Text style={styles.cardBottomRightText}>
                  Started {activeBooking.started}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={onBookSlotPress}
          >
            <View style={styles.actionIconContainer}>
              {renderCalendarIcon()}
            </View>
            <Text style={styles.actionTitle}>Book a slot</Text>
            <Text style={styles.actionSubtitle}>Reserve remotely</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => {
              if (activeBooking) {
                setIsTrackingModalOpen(true);
              } else {
                Alert.alert('No Active Bookings', 'You must book a clinic slot first to track your live queue.');
              }
            }}
          >
            <View style={styles.actionIconContainer}>
              {renderClockIcon()}
            </View>
            <Text style={styles.actionTitle}>Live queue</Text>
            <Text style={styles.actionSubtitle}>Track turn</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.sectionContainer, styles.clinicsSection]}>
        <View style={styles.clinicsHeaderRow}>
          <Text style={styles.sectionTitle}>Nearby clinics</Text>
          <TouchableOpacity onPress={onSeeAllPress}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {clinics.length > 0 ? (
          clinics.map(clinic => (
            <TouchableOpacity
              key={clinic._id || clinic.id}
              style={styles.clinicCard}
              activeOpacity={0.8}
              onPress={() => onClinicCardPress(clinic)}
            >
              <View style={styles.stethoscopeCircle}>
                {renderStethoscopeIcon()}
              </View>
              <View style={styles.clinicInfoContainer}>
                <Text style={styles.clinicTitleText}>
                  {clinic.doctor} — {clinic.specialty}
                </Text>
                <View style={styles.locationRow}>
                  {renderMapPinIcon()}
                  <Text style={styles.locationText}>{clinic.clinic}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#2ECC71', marginRight: 6 }} />
                  <Text style={{ fontSize: 12, color: '#2ECC71', fontWeight: '700' }}>
                    Ongoing Call: Ticket #{clinic.currentServing || 1}
                  </Text>
                </View>
                <View style={styles.clinicFooterRow}>
                  <View style={styles.queueBadge}>
                    <Text style={styles.queueBadgeText}>
                      {clinic.inQueue} in queue
                    </Text>
                  </View>
                  <Text style={styles.etaText}>~{clinic.eta} min</Text>
                </View>
              </View>
              <View style={styles.chevronContainer}>
                {renderChevronRight()}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ backgroundColor: COLORS.white, borderRadius: 24, padding: 24, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: 'rgba(229, 236, 238, 0.5)' }}>
            <Text style={{ color: COLORS.textMuted, fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 22 }}>
              No clinics are hosting active sessions at the moment. Please wait for doctors to start their session.
            </Text>
          </View>
        )}
      </View>
      {/* Live Queue Tracking Modal */}
      {activeBooking && (
        <Modal
          visible={isTrackingModalOpen}
          animationType="slide"
          onRequestClose={() => setIsTrackingModalOpen(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgTint }}>
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottomWidth: 1, borderBottomColor: COLORS.inputBorder, backgroundColor: COLORS.white }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 0.5 }}>LIVE TRACKING</Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginTop: 2 }}>{activeBooking.clinic?.doctor}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsTrackingModalOpen(false)}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgTabContainer, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.textDark }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
              {/* Clinic/Specialty Info Card */}
              <View style={{ backgroundColor: COLORS.white, borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: COLORS.inputBorder }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textDark }}>{activeBooking.clinic?.clinic}</Text>
                <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>{activeBooking.clinic?.specialty}</Text>
              </View>

              {/* Queue Progress Stats */}
              <View style={{ backgroundColor: COLORS.white, borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.inputBorder }}>
                
                {/* Serving & Ticket Numbers */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 24 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.textMuted }}>NOW SERVING</Text>
                    <Text style={{ fontSize: 40, fontWeight: '900', color: COLORS.primary, marginTop: 6 }}>
                      #{activeBooking.clinic?.currentServing || 1}
                    </Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: COLORS.inputBorder }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.textMuted }}>YOUR TICKET</Text>
                    <Text style={{ fontSize: 40, fontWeight: '900', color: COLORS.textDark, marginTop: 6 }}>
                      #{activeBooking.number}
                    </Text>
                  </View>
                </View>

                {/* Ahead Calculation */}
                {activeBooking.number - (activeBooking.clinic?.currentServing || 1) > 0 ? (
                  <View style={{ backgroundColor: COLORS.primaryLight, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, marginBottom: 24 }}>
                    <Text style={{ color: COLORS.primaryDark, fontSize: 13, fontWeight: '700' }}>
                      {activeBooking.number - (activeBooking.clinic?.currentServing || 1)} patient(s) ahead of you
                    </Text>
                  </View>
                ) : activeBooking.number === (activeBooking.clinic?.currentServing || 1) ? (
                  <View style={{ backgroundColor: '#EAFAD1', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, marginBottom: 24 }}>
                    <Text style={{ color: '#2ECC71', fontSize: 13, fontWeight: '800' }}>
                      It is your turn! Please enter the room.
                    </Text>
                  </View>
                ) : (
                  <View style={{ backgroundColor: COLORS.bgTabContainer, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, marginBottom: 24 }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: '700' }}>
                      Your turn has passed or completed
                    </Text>
                  </View>
                )}

                {/* Progress Visualizer */}
                <View style={{ width: '100%', height: 8, backgroundColor: COLORS.bgTabContainer, borderRadius: 4, position: 'relative', marginBottom: 32 }}>
                  <View
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      borderRadius: 4,
                      backgroundColor: COLORS.primary,
                      width: `${Math.min(100, Math.max(0, ((activeBooking.clinic?.currentServing || 1) / activeBooking.number) * 100))}%`
                    }}
                  />
                </View>

                {/* Estimated wait info */}
                <View style={{ width: '100%' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: '500' }}>Est. Waiting Time:</Text>
                    <Text style={{ fontSize: 14, color: COLORS.textDark, fontWeight: '700' }}>~ {activeBooking.wait} mins</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: '500' }}>AI-Predicted Time:</Text>
                    <Text style={{ fontSize: 14, color: COLORS.textDark, fontWeight: '700' }}>{activeBooking.predicted}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: '500' }}>Session Started:</Text>
                    <Text style={{ fontSize: 14, color: COLORS.textDark, fontWeight: '700' }}>{activeBooking.started}</Text>
                  </View>
                </View>

              </View>

              {/* Refresh Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.primary,
                  height: 56,
                  borderRadius: 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 24,
                  flexDirection: 'row',
                }}
                activeOpacity={0.85}
                disabled={refreshing}
                onPress={async () => {
                  if (refreshBooking) {
                    setRefreshing(true);
                    await refreshBooking();
                    setRefreshing(false);
                  }
                }}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '800' }}>Refresh Live Queue</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  headerBlock: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
    paddingBottom: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: Platform.OS === 'android' ? 12 : 0,
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  profileNameText: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBellContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFB300',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  activeBookingCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 24,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  liveBadge: {
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  cardNumberCol: {
    flex: 1.2,
  },
  cardNumberLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  cardNumberText: {
    color: COLORS.white,
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 48,
  },
  cardEstimateCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  aiEstimateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sparkleIcon: {
    marginRight: 4,
  },
  cardEstimateLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    fontWeight: '500',
  },
  cardEstimateValue: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 14,
  },
  cardBottomLeft: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '500',
  },
  cardBottomRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playIcon: {
    marginRight: 4,
  },
  cardBottomRightText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '500',
  },
  sectionContainer: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: COLORS.white,
    width: '48%',
    borderRadius: 24,
    padding: 18,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 236, 238, 0.5)',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  clinicsSection: {
    marginBottom: 20,
  },
  clinicsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  clinicCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 236, 238, 0.5)',
  },
  stethoscopeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clinicInfoContainer: {
    flex: 1,
    paddingHorizontal: 14,
  },
  clinicTitleText: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinIcon: {
    marginRight: 4,
  },
  locationText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  clinicFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueBadge: {
    backgroundColor: '#E6F9F6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
  },
  queueBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  etaText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeTab;
