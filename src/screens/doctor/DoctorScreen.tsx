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
  TextInput,
  Modal,
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

  // Helper to get current time formatted as "H:MM AM/PM"
  const getCurrentTimeFormatted = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

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

  // Start session forms states
  const [isOpen, setIsOpen] = useState(false);
  const [maxPatients, setMaxPatients] = useState('14');
  const [startingSession, setStartingSession] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const [activatingRealTime, setActivatingRealTime] = useState(false);

  // Dropdown & Edit Modal States
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDoctorName, setEditDoctorName] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editClinicName, setEditClinicName] = useState('');
  const [updatingDetails, setUpdatingDetails] = useState(false);

  const handleOpenEditModal = () => {
    setEditDoctorName(doctorName);
    setEditSpecialty(specialty);
    setEditClinicName(clinicName);
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handleSaveDetails = async () => {
    if (!editDoctorName.trim() || !editSpecialty.trim() || !editClinicName.trim()) {
      Alert.alert('Error', 'Please fill in all details');
      return;
    }
    
    try {
      setUpdatingDetails(true);
      const response = await api.put('/doctor/update-details', {
        doctor: editDoctorName.trim(),
        specialty: editSpecialty.trim(),
        clinicName: editClinicName.trim(),
      });
      
      if (response.data.success) {
        setDoctorName(editDoctorName.trim());
        setSpecialty(editSpecialty.trim());
        setClinicName(editClinicName.trim());
        setShowEditModal(false);
        Alert.alert('Success', 'Profile details updated successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update details. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setUpdatingDetails(false);
    }
  };

  // Generate valid hours within next 11 hours
  const generateUpcomingHours = () => {
    const hoursList = [];
    const now = new Date();
    let currentHour = now.getHours();

    for (let i = 0; i <= 11; i++) {
      const hr = (currentHour + i) % 24;
      const ampm = hr >= 12 ? 'PM' : 'AM';
      const displayHr = hr % 12 === 0 ? 12 : hr % 12;
      hoursList.push({
        rawHour: hr,
        label: `${displayHr} ${ampm}`,
        ampm: ampm,
        displayHr: displayHr
      });
    }
    return hoursList;
  };

  const upcomingHours = generateUpcomingHours();
  const [selectedHourObj, setSelectedHourObj] = useState(upcomingHours[0]);
  
  const getNearest5MinutesStr = () => {
    const now = new Date();
    const roundedMins = Math.round(now.getMinutes() / 5) * 5;
    if (roundedMins >= 60) return '00';
    return roundedMins < 10 ? '0' + roundedMins : '' + roundedMins;
  };
  const [selectedMinute, setSelectedMinute] = useState(getNearest5MinutesStr());
  const [startTime, setStartTime] = useState('');

  useEffect(() => {
    if (selectedHourObj) {
      setStartTime(`${selectedHourObj.displayHr}:${selectedMinute} ${selectedHourObj.ampm}`);
    }
  }, [selectedHourObj, selectedMinute]);

  const minuteOptions = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

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
        setIsOpen(data.isOpen);
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

  const handleStartSession = async () => {
    if (!startTime || !maxPatients) {
      Alert.alert('Error', 'Please enter a start time and max patients queue limit.');
      return;
    }

    try {
      setStartingSession(true);
      const response = await api.post('/doctor/start-session', {
        scheduledStart: startTime,
        maxPatients: parseInt(maxPatients, 10),
      });

      if (response.data.success) {
        Alert.alert('Session Started', 'Your clinic session is now live! Patients can book slots.');
        await fetchDoctorQueueStatus(true);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to start session.';
      Alert.alert('Error', message);
    } finally {
      setStartingSession(false);
    }
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this clinic session? This will close the queue for patients and clear any active bookings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              setEndingSession(true);
              const response = await api.post('/doctor/end-session');
              if (response.data.success) {
                Alert.alert('Session Ended', 'Your clinic session has been closed successfully.');
                await fetchDoctorQueueStatus(true);
              }
            } catch (error: any) {
              const message = error.response?.data?.message || 'Failed to end session.';
              Alert.alert('Error', message);
            } finally {
              setEndingSession(false);
            }
          },
        },
      ]
    );
  };

  const handleActivateRealTime = async () => {
    try {
      setActivatingRealTime(true);
      const response = await api.post('/doctor/activate-real-time');
      if (response.data.success) {
        Alert.alert('Session Active', 'You have officially started the clinic session! Live call is active.');
        await fetchDoctorQueueStatus(true);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to start session in real time.';
      Alert.alert('Error', message);
    } finally {
      setActivatingRealTime(false);
    }
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
          onPress={() => setShowMenu(!showMenu)}
          style={styles.menuButton}
        >
          {renderMenuIcon()}
        </TouchableOpacity>
      </View>

      {/* Hamburger Dropdown Menu */}
      {showMenu && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity 
            style={styles.dropdownItem} 
            onPress={handleOpenEditModal}
          >
            <Text style={styles.dropdownText}>Edit Details</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dropdownItem, styles.dropdownItemLast]} 
            onPress={() => {
              setShowMenu(false);
              onLogout();
            }}
          >
            <Text style={[styles.dropdownText, styles.dropdownTextDestructive]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {!isOpen ? (
          <View style={styles.startSessionCard}>
            <View style={styles.startSessionHeader}>
              <Text style={styles.startSessionSub}>SESSION CONTROLLER</Text>
              <Text style={styles.startSessionTitle}>Start Clinic Session</Text>
            </View>

            <Text style={styles.startSessionDesc}>
              Patients will only be able to view your clinic and book numbers after you start the session.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>CHOOSE START HOUR (NEXT 11 HOURS)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {upcomingHours.map((hrObj, idx) => {
                  const isSelected = selectedHourObj.label === hrObj.label;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.timePill,
                        isSelected && styles.timePillSelected
                      ]}
                      onPress={() => setSelectedHourObj(hrObj)}
                    >
                      <Text
                        style={[
                          styles.timePillText,
                          isSelected && styles.timePillTextSelected
                        ]}
                      >
                        {hrObj.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>CHOOSE START MINUTE</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {minuteOptions.map((min, idx) => {
                  const isSelected = selectedMinute === min;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.timePill,
                        isSelected && styles.timePillSelected
                      ]}
                      onPress={() => setSelectedMinute(min)}
                    >
                      <Text
                        style={[
                          styles.timePillText,
                          isSelected && styles.timePillTextSelected
                        ]}
                      >
                        :{min}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.selectedTimeDisplay}>
              <Text style={styles.selectedTimeLabel}>SELECTED START TIME</Text>
              <Text style={styles.selectedTimeValue}>{startTime}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>MAX PATIENTS (QUEUE LIMIT)</Text>
              <TextInput
                style={styles.textInput}
                value={maxPatients}
                onChangeText={setMaxPatients}
                placeholder="e.g. 14"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <TouchableOpacity
              style={styles.startBtn}
              activeOpacity={0.85}
              disabled={startingSession}
              onPress={handleStartSession}
            >
              {startingSession ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.startBtnText}>Place Session</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
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

            {/* Session Call Handler / Now Serving Card */}
            {actualStart === '--:--' ? (
              <View style={styles.activateSessionCard}>
                <View style={styles.activateSessionLeft}>
                  <Text style={styles.activateSessionLabel}>CLINIC STATUS</Text>
                  <Text style={styles.activateSessionValue}>Open for Booking</Text>
                  <Text style={styles.activateSessionDesc}>
                    {inQueue} patient{inQueue !== 1 ? 's' : ''} in queue. Click below to start the live session in real-time.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.activateSessionBtn}
                  activeOpacity={0.85}
                  disabled={activatingRealTime}
                  onPress={handleActivateRealTime}
                >
                  {activatingRealTime ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.activateSessionBtnText}>Start Session</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
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
            )}

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

            {/* End Session Button */}
            <TouchableOpacity
              style={styles.endSessionBtn}
              activeOpacity={0.85}
              disabled={endingSession}
              onPress={handleEndSession}
            >
              {endingSession ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.endSessionBtnText}>End Clinic Session</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Edit Doctor Details Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile Details</Text>
              <Text style={styles.modalSubtitle}>Update your clinic credentials</Text>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>DOCTOR NAME</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editDoctorName}
                onChangeText={setEditDoctorName}
                placeholder="e.g. Dr. Silva"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>CLINIC TYPE / SPECIALTY</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editSpecialty}
                onChangeText={setEditSpecialty}
                placeholder="e.g. General Physician"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>CLINIC LOCATION / ROOM</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editClinicName}
                onChangeText={setEditClinicName}
                placeholder="e.g. Consultation Suite Room 1"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowEditModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleSaveDetails}
                disabled={updatingDetails}
                activeOpacity={0.8}
              >
                {updatingDetails ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalBtnSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  startSessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
  },
  startSessionHeader: {
    marginBottom: 16,
  },
  startSessionSub: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  startSessionTitle: {
    color: COLORS.textDark,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  startSessionDesc: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: COLORS.textDark,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  textInput: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.bgTint,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  startBtn: {
    backgroundColor: '#2ECC71',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  horizontalScroll: {
    paddingVertical: 4,
    gap: 8,
  },
  timePill: {
    backgroundColor: COLORS.bgTint,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    marginRight: 8,
  },
  timePillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timePillText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '700',
  },
  timePillTextSelected: {
    color: COLORS.white,
  },
  selectedTimeDisplay: {
    backgroundColor: COLORS.bgTint,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  selectedTimeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  selectedTimeValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 4,
  },
  endSessionBtn: {
    backgroundColor: COLORS.error,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  endSessionBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activateSessionCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    padding: 24,
    flexDirection: 'column',
    alignItems: 'stretch',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 32,
  },
  activateSessionLeft: {
    marginBottom: 16,
  },
  activateSessionLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  activateSessionValue: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 4,
  },
  activateSessionDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  activateSessionBtn: {
    backgroundColor: '#2ECC71',
    borderRadius: 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  activateSessionBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  dropdownMenu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 74 : 86,
    right: 24,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    width: 160,
    zIndex: 1000,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 236, 238, 0.6)',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  dropdownTextDestructive: {
    color: COLORS.error,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 44, 61, 0.4)',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 24,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '950',
    color: COLORS.textDark,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modalTextInput: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.bgTint,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: COLORS.bgTint,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  modalBtnCancelText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  modalBtnSave: {
    backgroundColor: COLORS.primary,
  },
  modalBtnSaveText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default DoctorScreen;
