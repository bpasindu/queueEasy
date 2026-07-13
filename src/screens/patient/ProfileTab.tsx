import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import COLORS from '../../theme/colors';

interface ProfileTabProps {
  userProfile: any;
  activeBooking: any;
  onLogout: () => void;
  onNavigateToBookingHistory?: () => void;
  onNavigateToHelpSupport?: () => void;
  onNavigateToPersonalDetails?: () => void;
  onNavigateToInsuranceInfo?: () => void;
  onNavigateToNotificationSettings?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userProfile,
  activeBooking,
  onLogout,
  onNavigateToBookingHistory,
  onNavigateToHelpSupport,
  onNavigateToPersonalDetails,
  onNavigateToInsuranceInfo,
  onNavigateToNotificationSettings,
}) => {
  const userName = userProfile?.name || 'Patient';
  const userEmail = userProfile?.email || 'patient@queueease.lk';
  const userVisits = userProfile?.visits || 0;
  
  // Calculate initials dynamically
  const nameParts = userName.split(' ');
  const initials = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : userName.slice(0, 2).toUpperCase();

  const currentTurn = activeBooking ? `#${activeBooking.number}` : 'None';

  const renderChevronRight = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path d="M9 5l7 7-7 7" stroke={COLORS.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );

  return (
    <ScrollView contentContainerStyle={styles.tabViewPadding} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabViewHeaderTitle}>My Profile</Text>

      <View style={styles.profileHeaderCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{initials}</Text>
        </View>
        <Text style={styles.profileNameLarge}>{userName}</Text>
        <Text style={styles.profileEmail}>{userEmail}</Text>

        <View style={styles.profileStatsRow}>
          <View style={styles.profileStatCol}>
            <Text style={styles.profileStatNumber}>{userVisits}</Text>
            <Text style={styles.profileStatLabel}>Visits</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStatCol}>
            <Text style={styles.profileStatNumber}>{currentTurn}</Text>
            <Text style={styles.profileStatLabel}>Current Turn</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileOptionsContainer}>
        <TouchableOpacity style={styles.profileOptionRow} onPress={onNavigateToPersonalDetails}>
          <Text style={styles.profileOptionText}>Personal Details</Text>
          {renderChevronRight()}
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileOptionRow} onPress={onNavigateToBookingHistory}>
          <Text style={styles.profileOptionText}>Booking History</Text>
          {renderChevronRight()}
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileOptionRow} onPress={onNavigateToInsuranceInfo}>
          <Text style={styles.profileOptionText}>Insurance Info</Text>
          {renderChevronRight()}
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileOptionRow} onPress={onNavigateToNotificationSettings}>
          <Text style={styles.profileOptionText}>Notification Settings</Text>
          {renderChevronRight()}
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileOptionRow} onPress={onNavigateToHelpSupport}>
          <Text style={styles.profileOptionText}>Help &amp; Support</Text>
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
};

const styles = StyleSheet.create({
  tabViewPadding: {
    padding: 24,
    paddingBottom: 40,
  },
  tabViewHeaderTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 24,
  },
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

export default ProfileTab;
