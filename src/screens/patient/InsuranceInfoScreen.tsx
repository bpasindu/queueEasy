import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import COLORS from '../../theme/colors';
import api from '../../services/api';

interface InsuranceInfoScreenProps {
  onBack: () => void;
}

export const InsuranceInfoScreen: React.FC<InsuranceInfoScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [provider, setProvider] = useState('');
  const [policy, setPolicy] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/profile');
        if (response.data.success) {
          const user = response.data.user;
          setProvider(user.insuranceProvider || '');
          setPolicy(user.insurancePolicy || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load insurance details. Please try again.');
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
        insuranceProvider: provider.trim(),
        insurancePolicy: policy.trim(),
      });

      if (response.data.success) {
        Alert.alert('Success', 'Insurance details updated successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update insurance details. Please try again.';
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
      <Text style={styles.headerTitle}>Insurance Info</Text>
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
        {/* Card Graphic */}
        <View style={styles.insuranceCardGraphic}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardBrand}>HEALTH INSURANCE</Text>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Circle cx="12" cy="12" r="10" stroke={COLORS.white} strokeWidth="2.5" fill="none" />
              <Path d="M12 7v10M7 12h10" stroke={COLORS.white} strokeWidth="2.5" strokeLinecap="round" />
            </Svg>
          </View>
          
          <Text style={styles.cardNumberText}>
            {policy ? policy.toUpperCase() : 'NO ACTIVE POLICY'}
          </Text>
          
          <View style={styles.cardFooterRow}>
            <View>
              <Text style={styles.cardLabel}>PROVIDER</Text>
              <Text style={styles.cardValueText}>{provider || 'Not Configured'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardLabel}>STATUS</Text>
              <Text style={[styles.cardValueText, { color: policy ? '#9FFFE0' : COLORS.white }]}>
                {policy ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>
        </View>

        {/* Inputs */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionHeader}>POLICY SETTINGS</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Insurance Provider</Text>
            <TextInput
              style={styles.textInput}
              value={provider}
              onChangeText={setProvider}
              placeholder="e.g. Allianz Insurance, Ceylinco, etc."
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Policy Number</Text>
            <TextInput
              style={styles.textInput}
              value={policy}
              onChangeText={setPolicy}
              placeholder="e.g. POL-991823A"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Insurance Info</Text>
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
  insuranceCardGraphic: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 24,
    height: 190,
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  cardNumberText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
    marginVertical: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
    opacity: 0.7,
    marginBottom: 4,
  },
  cardValueText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.bgTint,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    color: COLORS.textDark,
    fontSize: 14,
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

export default InsuranceInfoScreen;
