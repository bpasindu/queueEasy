import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import HomeScreen from './src/screens/patient/HomeScreen';
import NotificationsScreen from './src/screens/patient/NotificationsScreen';
import BookingHistoryScreen from './src/screens/patient/BookingHistoryScreen';
import HelpSupportScreen from './src/screens/patient/HelpSupportScreen';
import DoctorScreen from './src/screens/doctor/DoctorScreen';
import Logo from './src/components/Logo';
import COLORS from './src/theme/colors';

type ScreenState =
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'patient_dashboard'
  | 'doctor_dashboard'
  | 'notifications'
  | 'booking_history'
  | 'help_support';

const SplashScreen = () => {
  return (
    <View style={styles.splashContainer}>
      <View style={styles.splashLogoContainer}>
        <View style={styles.splashIconCircle}>
          <Svg width={72} height={72} viewBox="0 0 48 48">
            <Path
              d="M 10 24 L 17 24 L 20 28 L 24 14 L 28 34 L 31 22 L 34 24 L 38 24"
              fill="none"
              stroke={COLORS.primary}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text style={styles.splashTitle}>QueueEase</Text>
        <Text style={styles.splashSubtitle}>Smart Queue Management</Text>
      </View>
      <ActivityIndicator size="large" color={COLORS.white} style={styles.splashSpinner} />
    </View>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('login');
  const [_userRole, setUserRole] = useState<'patient' | 'doctor'>('patient');
  const [servingNumber, setServingNumber] = useState(4);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = (role: 'patient' | 'doctor') => {
    setUserRole(role);
    setCurrentScreen(role === 'patient' ? 'patient_dashboard' : 'doctor_dashboard');
  };

  const handleRegisterSuccess = (role: 'patient' | 'doctor') => {
    setUserRole(role);
    setCurrentScreen(role === 'patient' ? 'patient_dashboard' : 'doctor_dashboard');
  };

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  const isDarkMode = useColorScheme() === 'dark';

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onNavigateToRegister={() => setCurrentScreen('register')}
            onNavigateToForgotPassword={() => setCurrentScreen('forgot_password')}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onNavigateToLogin={() => setCurrentScreen('login')}
            onRegisterSuccess={handleRegisterSuccess}
          />
        );
      case 'forgot_password':
        return (
          <ForgotPasswordScreen
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            onBack={() => setCurrentScreen('patient_dashboard')}
          />
        );
      case 'booking_history':
        return (
          <BookingHistoryScreen
            onBack={() => setCurrentScreen('patient_dashboard')}
          />
        );
      case 'help_support':
        return (
          <HelpSupportScreen
            onBack={() => setCurrentScreen('patient_dashboard')}
          />
        );
      case 'patient_dashboard':
        return (
          <HomeScreen
            onLogout={handleLogout}
            userName="Nimal Perera"
            onNavigateToNotifications={() => setCurrentScreen('notifications')}
            onNavigateToBookingHistory={() => setCurrentScreen('booking_history')}
            onNavigateToHelpSupport={() => setCurrentScreen('help_support')}
          />
        );
      case 'doctor_dashboard':
        return (
          <DoctorScreen onLogout={handleLogout} />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {showSplash ? <SplashScreen /> : renderScreen()}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dashboardContainer: { flex: 1, backgroundColor: COLORS.bgTint },
  dashboardContent: { padding: 24 },
  dashboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  logoutButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.inputBorder },
  logoutText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  welcomeSection: { marginBottom: 32 },
  welcomeText: { fontSize: 28, fontWeight: '800', color: COLORS.textDark, marginBottom: 6 },
  subtext: { fontSize: 15, color: COLORS.textMuted },
  queueCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24, shadowColor: COLORS.shadowColor, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, marginBottom: 24 },
  cardHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: COLORS.textMuted, marginBottom: 16 },
  ticketContainer: { alignItems: 'center', marginVertical: 12 },
  ticketLabel: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600', marginBottom: 4 },
  ticketLabelOpacity: { color: COLORS.white, opacity: 0.7 },
  ticketNumber: { fontSize: 64, fontWeight: '900', color: COLORS.textDark },
  ticketNumberColor: { color: COLORS.white },
  dividerLight: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  queueStatusRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statusCol: { alignItems: 'center' },
  statusLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500', marginBottom: 4 },
  statusLabelOpacity: { color: COLORS.white, opacity: 0.6 },
  statusValue: { fontSize: 20, fontWeight: '700', color: COLORS.textDark },
  statusValueWhite: { color: COLORS.white },
  statusValuePrimary: { color: COLORS.primary },
  advanceButton: { backgroundColor: COLORS.primary, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  advanceButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  splashIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  splashSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  splashSpinner: {
    position: 'absolute',
    bottom: 80,
  },
});

export default App;
