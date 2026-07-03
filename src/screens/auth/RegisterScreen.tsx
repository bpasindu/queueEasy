import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import Logo from '../../components/Logo';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import COLORS from '../../theme/colors';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: (role: 'patient' | 'doctor') => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name,
        email: email.trim(),
        phone,
        password,
        role,
      });
      if (response.data.success) {
        const token = response.data.data.token;
        if (token) {
          await AsyncStorage.setItem('jwtToken', token);
        }
        onRegisterSuccess(role);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Header with Back Button */}
          <View style={styles.topNavigation}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={onNavigateToLogin}
              style={styles.backButton}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24">
                <Path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke={COLORS.textDark}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </TouchableOpacity>
            
            <View style={styles.headerRight}>
              <Logo size={36} />
              <Text style={styles.miniBrandName}>QueueEase</Text>
            </View>
          </View>

          {/* Title & Subtitle */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Create account</Text>
            <Text style={styles.subtitleText}>
              Join us to track clinic queues and manage appointments instantly.
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.formContainer}>
            {/* Custom Tab Switcher (Segmented Control) for Role Selection */}
            <View style={styles.roleContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setRole('patient')}
                style={[
                  styles.roleButton,
                  role === 'patient' && styles.activeRoleButton,
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === 'patient' && styles.activeRoleText,
                  ]}
                >
                  Patient
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setRole('doctor')}
                style={[
                  styles.roleButton,
                  role === 'doctor' && styles.activeRoleButton,
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === 'doctor' && styles.activeRoleText,
                  ]}
                >
                  Doctor / Staff
                </Text>
              </TouchableOpacity>
            </View>

            <CustomInput
              iconType="user"
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <CustomInput
              iconType="email"
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <CustomInput
              iconType="phone"
              placeholder="Phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <CustomInput
              iconType="lock"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <CustomButton
              title="Create account"
              onPress={handleRegister}
              loading={loading}
            />
          </View>

          {/* Bottom Footer Link */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerNormalText}>Already have an account? </Text>
            <TouchableOpacity activeOpacity={0.6} onPress={onNavigateToLogin}>
              <Text style={styles.footerLinkText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgTint,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  topNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 10 : 25,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniBrandName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginLeft: 8,
  },
  titleContainer: {
    marginBottom: 28,
  },
  titleText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  roleContainer: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: COLORS.bgTabContainer,
    borderRadius: 26,
    padding: 4,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  activeRoleButton: {
    backgroundColor: COLORS.bgTabActive,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeRoleText: {
    color: COLORS.textDark,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    paddingVertical: 16,
  },
  footerNormalText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  footerLinkText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default RegisterScreen;
