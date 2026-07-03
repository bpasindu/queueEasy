import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../../components/Logo';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import COLORS from '../../theme/colors';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword?: () => void;
  onLoginSuccess: (role: 'patient' | 'doctor') => void;
}

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onLoginSuccess,
}) => {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Animated value for tab sliding
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleRoleChange = (newRole: 'patient' | 'doctor') => {
    if (newRole === role) return;

    setRole(newRole);
    setEmail('');
    setPassword('');

    Animated.spring(slideAnim, {
      toValue: newRole === 'patient' ? 0 : 1,
      useNativeDriver: false, // Position layout animations require layout driver
      bounciness: 8,
    }).start();
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
        role,
      });

      if (response.data.success) {
        const token = response.data.data.token;
        await AsyncStorage.setItem('jwtToken', token);
        onLoginSuccess(role);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  // Interpolate slide position
  const switchWidth = width - 48; // Padding horizontal is 24 on each side
  const tabWidth = switchWidth / 2;
  const slideTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, tabWidth - 4], // Add margin for spacing inside container
  });

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
          {/* Top Brand Header */}
          <View style={styles.headerContainer}>
            <Logo size={48} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.brandName}>QueueEase</Text>
              <Text style={styles.brandTagline}>Smart Clinic Queues</Text>
            </View>
          </View>

          {/* Title & Subtitle */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>
              Skip the wait. Book your spot, track your turn — from anywhere.
            </Text>
          </View>

          {/* Custom Tab Switcher (Segmented Control) */}
          <View style={styles.tabContainer}>
            {/* Animated white slide background */}
            <Animated.View
              style={[
                styles.activeTabIndicator,
                {
                  width: tabWidth - 4,
                  transform: [{ translateX: slideTranslateX }],
                },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleRoleChange('patient')}
              style={styles.tabButton}
            >
              <Text
                style={[
                  styles.tabText,
                  role === 'patient' && styles.activeTabText,
                ]}
              >
                Patient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleRoleChange('doctor')}
              style={styles.tabButton}
            >
              <Text
                style={[
                  styles.tabText,
                  role === 'doctor' && styles.activeTabText,
                ]}
              >
                Doctor / Staff
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields Container */}
          <View style={styles.formContainer}>
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
              iconType="lock"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Sign in Button */}
            <CustomButton
              title="Sign in"
              onPress={handleSignIn}
              loading={loading}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity activeOpacity={0.6} style={styles.forgotContainer} onPress={onNavigateToForgotPassword}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Navigation Link */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerNormalText}>New here? </Text>
            <TouchableOpacity activeOpacity={0.6} onPress={onNavigateToRegister}>
              <Text style={styles.footerLinkText}>Create account</Text>
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
    justifyContent: 'space-between', // Push footer to bottom
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : 40,
    marginBottom: 40,
  },
  headerTextContainer: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 26,
  },
  brandTagline: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  welcomeContainer: {
    marginBottom: 36,
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 24,
    fontWeight: '400',
  },
  tabContainer: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: COLORS.bgTabContainer,
    borderRadius: 26,
    padding: 4,
    position: 'relative',
    marginBottom: 32,
  },
  activeTabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: COLORS.bgTabActive,
    borderRadius: 22,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.textDark,
    fontWeight: '700',
  },
  formContainer: {
    flex: 1,
  },
  forgotContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  forgotText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '600',
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

export default LoginScreen;
