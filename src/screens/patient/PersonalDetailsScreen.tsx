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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import COLORS from '../../theme/colors';
import api from '../../services/api';

interface PersonalDetailsScreenProps {
  onBack: () => void;
}

export const PersonalDetailsScreen: React.FC<PersonalDetailsScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/profile');
        if (response.data.success) {
          const user = response.data.user;
          setName(user.name || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
          setAge(user.age ? user.age.toString() : '');
          setGender(user.gender || 'Male');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load personal details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Validation Error', 'Name, Email, and Phone cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/auth/profile', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        age: age ? parseInt(age) : undefined,
        gender: gender,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Personal details updated successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile. Please try again.';
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
      <Text style={styles.headerTitle}>Personal Details</Text>
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
        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>BASIC INFORMATION</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Pasindu Buddhima"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.textInput, styles.disabledInput]}
              value={email}
              editable={false}
              placeholder="e.g. passbudd@gmail.com"
              placeholderTextColor={COLORS.textLight}
            />
            <Text style={styles.inputNote}>Email address cannot be changed.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="e.g. +94 77 123 4567"
              placeholderTextColor={COLORS.textLight}
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>ADDITIONAL DETAILS</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="e.g. 25"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1.5 }]}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female'].map((g) => {
                  const isActive = gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderBtn, isActive && styles.genderBtnActive]}
                      onPress={() => setGender(g)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.genderBtnText, isActive && styles.genderBtnTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
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
            <Text style={styles.saveBtnText}>Save Changes</Text>
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
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  cardHeader: {
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
  disabledInput: {
    backgroundColor: '#F5F8F9',
    color: COLORS.textLight,
  },
  inputNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgTint,
    borderRadius: 14,
    padding: 4,
    height: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  genderBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  genderBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  genderBtnText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  genderBtnTextActive: {
    color: COLORS.primary,
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

export default PersonalDetailsScreen;
