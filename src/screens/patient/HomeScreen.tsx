import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import COLORS from '../../theme/colors';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onLogout: () => void;
  userName?: string;
}

type TabType = 'Home' | 'Book' | 'Assist' | 'Profile';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onLogout,
  userName = 'Nimal Perera',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('Home');

  // Interactive state for testing
  const [activeBooking, setActiveBooking] = useState({
    number: 7,
    wait: 26,
    predicted: '9:56.400000000000009 AM',
    started: '9:18 AM',
    live: true,
  });

  const [assistMessages, setAssistMessages] = useState<Array<{ id: number; text: string; sender: 'user' | 'bot' }>>([
    { id: 1, text: "Hello! I am your QueueEase assistant. How can I help you today?", sender: 'bot' },
    { id: 2, text: "Can you tell me how many people are in queue for Dr. Silva?", sender: 'user' },
    { id: 3, text: "Dr. Silva currently has 5 patients in the queue. The estimated waiting time is approximately 18 minutes.", sender: 'bot' },
  ]);

  const [inputText, setInputText] = useState('');

  const clinics = [
    {
      id: 1,
      doctor: 'Dr. Silva',
      specialty: 'General Physician',
      clinic: 'Nugegoda Clinic',
      inQueue: 5,
      eta: 18,
    },
    {
      id: 2,
      doctor: 'Dr. Fernando',
      specialty: 'Pediatrician',
      clinic: 'Maharagama Medical',
      inQueue: 12,
      eta: 32,
    },
    {
      id: 3,
      doctor: 'Dr. Jayasinghe',
      specialty: 'ENT',
      clinic: 'Colombo 05',
      inQueue: 3,
      eta: 12,
    },
  ];

  // Render SVG icons helper functions to avoid packages dependencies
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

  // Bottom Navigation Icons
  const renderTabIcon = (tab: TabType, isActive: boolean) => {
    const strokeColor = isActive ? COLORS.primary : COLORS.textMuted;
    const fillValue = isActive ? 'none' : 'none';

    switch (tab) {
      case 'Home':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill={fillValue}>
            <Path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M9 22V12h6v10"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'Book':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill={fillValue}>
            <Rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              ry="2"
              stroke={strokeColor}
              strokeWidth="2"
            />
            <Path
              d="M16 2v4M8 2v4M3 10h18"
              stroke={strokeColor}
              strokeWidth="2"
            />
          </Svg>
        );
      case 'Assist':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill={fillValue}>
            <Path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'Profile':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill={fillValue}>
            <Path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="12"
              cy="7"
              r="4"
              stroke={strokeColor}
              strokeWidth="2"
            />
          </Svg>
        );
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg = { id: Date.now(), text: inputText, sender: 'user' as const };
    setAssistMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulated reply
    setTimeout(() => {
      setAssistMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "I am currently monitoring the status. Your slot is active. Feel free to navigate around the app!",
          sender: 'bot' as const,
        },
      ]);
    }, 1000);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Curved Header Container */}
            <View style={styles.headerBlock}>
              <View style={styles.headerTopRow}>
                <View>
                  <Text style={styles.greetingText}>Good morning</Text>
                  <Text style={styles.profileNameText}>{userName} 👋</Text>
                </View>
                <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
                  {renderBellIcon()}
                </TouchableOpacity>
              </View>

              {/* Active Booking Card inside Header */}
              <View style={styles.activeBookingCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeaderTitle}>ACTIVE BOOKING</Text>
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
              </View>
            </View>

            {/* Quick Actions Grid */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Quick actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity style={styles.actionCard} activeOpacity={0.85}>
                  <View style={styles.actionIconContainer}>
                    {renderCalendarIcon()}
                  </View>
                  <Text style={styles.actionTitle}>Book a slot</Text>
                  <Text style={styles.actionSubtitle}>Reserve remotely</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} activeOpacity={0.85}>
                  <View style={styles.actionIconContainer}>
                    {renderClockIcon()}
                  </View>
                  <Text style={styles.actionTitle}>Live queue</Text>
                  <Text style={styles.actionSubtitle}>Track turn</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nearby Clinics Scroll */}
            <View style={[styles.sectionContainer, styles.clinicsSection]}>
              <View style={styles.clinicsHeaderRow}>
                <Text style={styles.sectionTitle}>Nearby clinics</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>

              {clinics.map(clinic => (
                <TouchableOpacity
                  key={clinic.id}
                  style={styles.clinicCard}
                  activeOpacity={0.8}
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
              ))}
            </View>
          </ScrollView>
        );
      case 'Book':
        return (
          <ScrollView contentContainerStyle={styles.tabViewPadding}>
            <Text style={styles.tabViewHeaderTitle}>Book a Clinic Slot</Text>
            <Text style={styles.tabViewSubtitle}>
              Select your favorite specialist and book a time slot to skip the waiting line.
            </Text>

            {clinics.map(clinic => (
              <TouchableOpacity
                key={clinic.id}
                style={styles.bookingListItem}
                activeOpacity={0.85}
              >
                <View style={styles.bookingListTop}>
                  <View style={styles.clinicImagePlaceholder}>
                    <Text style={styles.clinicInitials}>
                      {clinic.doctor.split(' ')[1][0]}
                    </Text>
                  </View>
                  <View style={styles.bookingListInfo}>
                    <Text style={styles.bookingDoctorName}>{clinic.doctor}</Text>
                    <Text style={styles.bookingDoctorSpecialty}>{clinic.specialty}</Text>
                    <Text style={styles.bookingDoctorLocation}>{clinic.clinic}</Text>
                  </View>
                </View>
                <View style={styles.bookingListBottom}>
                  <Text style={styles.nextAvailableText}>Next available slot: Today, 4:30 PM</Text>
                  <View style={styles.bookingBookBtn}>
                    <Text style={styles.bookingBookBtnText}>Book Now</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );
      case 'Assist':
        return (
          <View style={styles.assistTabContainer}>
            <View style={styles.assistHeader}>
              <Text style={styles.assistTitle}>AI Queue Assistant</Text>
              <Text style={styles.assistSubtitle}>Ask anything about live clinic waiting times</Text>
            </View>
            <ScrollView
              style={styles.assistChatScroll}
              contentContainerStyle={styles.assistChatContent}
            >
              {assistMessages.map(msg => (
                <View
                  key={msg.id}
                  style={[
                    styles.chatBubble,
                    msg.sender === 'user' ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.chatText,
                      msg.sender === 'user' ? styles.userChatText : styles.botChatText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.assistInputArea}>
              <View style={styles.assistInputWrapper}>
                <ScrollView horizontal scrollsToTop={false} style={{ flex: 1 }}>
                  <Text style={{ display: 'none' }} />
                </ScrollView>
                <TouchableOpacity
                  style={styles.assistSendBtn}
                  onPress={handleSendMessage}
                  activeOpacity={0.8}
                >
                  <Text style={styles.assistSendText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 'Profile':
        return (
          <ScrollView contentContainerStyle={styles.tabViewPadding}>
            <Text style={styles.tabViewHeaderTitle}>My Profile</Text>

            <View style={styles.profileHeaderCard}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>NP</Text>
              </View>
              <Text style={styles.profileNameLarge}>{userName}</Text>
              <Text style={styles.profileEmail}>nimal.perera@gmail.com</Text>

              <View style={styles.profileStatsRow}>
                <View style={styles.profileStatCol}>
                  <Text style={styles.profileStatNumber}>18</Text>
                  <Text style={styles.profileStatLabel}>Visits</Text>
                </View>
                <View style={styles.profileStatDivider} />
                <View style={styles.profileStatCol}>
                  <Text style={styles.profileStatNumber}>#7</Text>
                  <Text style={styles.profileStatLabel}>Current Turn</Text>
                </View>
              </View>
            </View>

            <View style={styles.profileOptionsContainer}>
              <TouchableOpacity style={styles.profileOptionRow}>
                <Text style={styles.profileOptionText}>Personal Details</Text>
                {renderChevronRight()}
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileOptionRow}>
                <Text style={styles.profileOptionText}>Booking History</Text>
                {renderChevronRight()}
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileOptionRow}>
                <Text style={styles.profileOptionText}>Insurance Info</Text>
                {renderChevronRight()}
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileOptionRow}>
                <Text style={styles.profileOptionText}>Notification Settings</Text>
                {renderChevronRight()}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={onLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.signOutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Content wrapper */}
      <View style={styles.mainContentContainer}>
        {renderActiveTabContent()}
      </View>

      {/* Custom Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {(['Home', 'Book', 'Assist', 'Profile'] as TabType[]).map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              {renderTabIcon(tab, isActive)}
              <Text
                style={[
                  styles.tabItemText,
                  isActive && styles.activeTabItemText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgTint,
  },
  mainContentContainer: {
    flex: 1,
  },
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
    backgroundColor: '#FFB300', // Yellow notification dot
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

  // Tab View Styling Helpers
  tabViewPadding: {
    padding: 24,
    paddingBottom: 40,
  },
  tabViewHeaderTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  tabViewSubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: 24,
  },
  tabBar: {
    flexDirection: 'row',
    height: 72,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  activeTabItemText: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Booking list style under Booking Tab
  bookingListItem: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  bookingListTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clinicImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  clinicInitials: {
    color: COLORS.primaryDark,
    fontSize: 18,
    fontWeight: '700',
  },
  bookingListInfo: {
    flex: 1,
  },
  bookingDoctorName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  bookingDoctorSpecialty: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bookingDoctorLocation: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  bookingListBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  nextAvailableText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  bookingBookBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bookingBookBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // Assist Tab Chat Styling
  assistTabContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  assistHeader: {
    marginBottom: 16,
  },
  assistTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  assistSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  assistChatScroll: {
    flex: 1,
    marginBottom: 16,
  },
  assistChatContent: {
    paddingVertical: 8,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userChatText: {
    color: COLORS.white,
  },
  botChatText: {
    color: COLORS.textDark,
  },
  assistInputArea: {
    marginBottom: Platform.OS === 'ios' ? 8 : 16,
  },
  assistInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    height: 48,
  },
  assistSendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistSendText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },

  // Profile Styling
  profileHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 28,
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  profileNameLarge: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 16,
  },
  profileStatCol: {
    alignItems: 'center',
    flex: 1,
  },
  profileStatNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  profileStatLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  profileStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5ECEE',
  },
  profileOptionsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  profileOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  profileOptionText: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  signOutBtn: {
    backgroundColor: 'rgba(255, 94, 94, 0.1)',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 94, 0.2)',
    marginBottom: 24,
  },
  signOutBtnText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeScreen;
