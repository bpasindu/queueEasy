import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import COLORS from '../../theme/colors';
import { clinics } from './constants';

interface HomeTabProps {
  userName: string;
  activeBooking: {
    number: number;
    wait: number;
    predicted: string;
    started: string;
    live: boolean;
  };
  onBookSlotPress: () => void;
  onClinicCardPress: (clinic: any) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  userName,
  activeBooking,
  onBookSlotPress,
  onClinicCardPress,
}) => {
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
