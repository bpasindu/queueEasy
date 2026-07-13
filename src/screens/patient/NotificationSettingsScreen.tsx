import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import COLORS from '../../theme/colors';
import api from '../../services/api';

interface NotificationSettingsScreenProps {
  onBack: () => void;
}

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [enabled, setEnabled] = useState(true);
  const [offset, setOffset] = useState(2); // Default to alert 2 slots before

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/profile');
        if (response.data.success) {
          const user = response.data.user;
          setEnabled(user.notificationsEnabled !== undefined ? user.notificationsEnabled : true);
          setOffset(user.notificationOffset || 2);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load notification settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/auth/profile', {
        notificationsEnabled: enabled,
        notificationOffset: offset,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Notification settings saved successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save settings. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity activeOpacity={0.6} onPress={onBack} style={styles.backButton}>
        <Svg width="20" height="20" viewBox="0 0 24 24">
          <Path
            d="M19 12H5M12 19l-7-7 7-7"
            stroke={COLORS.textDark}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Notifications</Text>
      <View style={styles.headerRight} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Toggle Block */}
        <View style={styles.settingsCard}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDesc}>
                Receive real-time alerts when your scheduled slot is approaching, or when delays are detected.
              </Text>
            </View>
            
            {/* Custom Toggle Switch */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setEnabled(!enabled)}
              style={[
                styles.switchTrack,
                enabled ? styles.switchTrackOn : styles.switchTrackOff
              ]}
            >
              <View
                style={[
                  styles.switchThumb,
                  enabled ? styles.switchThumbOn : styles.switchThumbOff
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Offset Options */}
        {enabled && (
          <View style={styles.settingsCard}>
            <Text style={styles.sectionHeader}>QUEUE ALERT LIMIT</Text>
            <Text style={styles.settingDesc}>
              Choose when you want to receive your "Next in Line" notification alert.
            </Text>

            <View style={styles.offsetOptionsGrid}>
              {[1, 2, 3, 5].map((val) => {
                const isSelected = offset === val;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.offsetBox,
                      isSelected && styles.offsetBoxSelected
                    ]}
                    onPress={() => setOffset(val)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.offsetNumText,
                        isSelected && styles.offsetNumTextSelected
                      ]}
                    >
                      {val}
                    </Text>
                    <Text
                      style={[
                        styles.offsetLabelText,
                        isSelected && styles.offsetLabelTextSelected
                      ]}
                    >
                      {val === 1 ? 'Slot Away' : 'Slots Away'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Notification Settings</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgTint,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  headerRight: {
    width: 36,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  settingDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  switchTrack: {
    width: 52,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: COLORS.primary,
  },
  switchTrackOff: {
    backgroundColor: '#E5ECEE',
  },
  switchThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
  switchThumbOff: {
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  offsetOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  offsetBox: {
    width: '47%',
    backgroundColor: COLORS.bgTint,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  offsetBoxSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  offsetNumText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  offsetNumTextSelected: {
    color: COLORS.primaryDark,
  },
  offsetLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  offsetLabelTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default NotificationSettingsScreen;
