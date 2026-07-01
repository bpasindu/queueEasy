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
import Svg, { Path, Circle } from 'react-native-svg';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import COLORS from '../../theme/colors';

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim(),
      });
      if (response.data.success) {
        setEmailSent(true);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset link. Please try again.';
      Alert.alert('Error', message);
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
          {/* Top Nav */}
          <View style={styles.topNavigation}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={onNavigateToLogin}
              style={styles.backButton}
            >
              <Svg width="20" height="20" viewBox="0 0 24 24">
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
            <Text style={styles.navTitle}>Reset password</Text>
          </View>

          {/* Key Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Svg width="28" height="28" viewBox="0 0 24 24">
                <Path
                  d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
                  stroke={COLORS.white}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </View>
          </View>

          {/* Title & Subtitle */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Forgot your password?</Text>
            <Text style={styles.subtitleText}>
              Enter the email linked to your QueueEase account and we'll send you a secure reset link.
            </Text>
          </View>

          {/* Form or Success State */}
          {!emailSent ? (
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

              <CustomButton
                title="Send reset link"
                onPress={handleSendResetLink}
                loading={loading}
                disabled={!email.trim()}
              />
            </View>
          ) : (
            <View style={styles.successCard}>
              {/* Green checkmark circle */}
              <View style={styles.checkCircle}>
                <Svg width="28" height="28" viewBox="0 0 24 24">
                  <Circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke={COLORS.primary}
                    strokeWidth="2"
                    fill="none"
                  />
                  <Path
                    d="M8 12l3 3 5-5"
                    stroke={COLORS.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              </View>

              <Text style={styles.successTitle}>Check your inbox</Text>
              <Text style={styles.successSubtitle}>
                A reset link has been sent to your email. It expires in 30 minutes.
              </Text>

              <CustomButton
                title="Back to sign in"
                onPress={onNavigateToLogin}
              />
            </View>
          )}

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerNormalText}>Remembered it? </Text>
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
  },
  topNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 25,
    marginBottom: 36,
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 14,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  iconContainer: {
    marginBottom: 28,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  titleContainer: {
    marginBottom: 32,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  // Success card
  successCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  checkCircle: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 8,
  },
  // Footer
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 12,
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

export default ForgotPasswordScreen;
