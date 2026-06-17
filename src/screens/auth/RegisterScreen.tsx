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
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Logo from '../../components/Logo';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import COLORS from '../../theme/colors';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    setLoading(true);
    // Simulate API registration call
    setTimeout(() => {
      setLoading(false);
      onRegisterSuccess();
    }, 1500);
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
