import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/patient/HomeScreen';
import Logo from './src/components/Logo';
import COLORS from './src/theme/colors';

type ScreenState = 'login' | 'register' | 'patient_dashboard' | 'doctor_dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('login');
  const [_userRole, setUserRole] = useState<'patient' | 'doctor'>('patient');
  const [servingNumber, setServingNumber] = useState(4); // initial state for demo

  const handleLoginSuccess = (role: 'patient' | 'doctor') => {
    setUserRole(role);
    setCurrentScreen(role === 'patient' ? 'patient_dashboard' : 'doctor_dashboard');
  };

  const handleRegisterSuccess = () => {
    setCurrentScreen('login');
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
      case 'patient_dashboard':
        return (
          <HomeScreen
            onLogout={handleLogout}
            userName="Nimal Perera"
          />
        );
      case 'doctor_dashboard':
        return (
          <SafeAreaView style={styles.dashboardContainer}>
            <ScrollView contentContainerStyle={styles.dashboardContent}>
              <View style={styles.dashboardHeader}>
                <Logo size={40} />
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.logoutText}>Sign out</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Dr. Sarah Jenkins</Text>
                <Text style={styles.subtext}>Cardiology Consultation Room 2</Text>
              </View>

              {/* Doctor Control Panel Card */}
              <View style={[styles.queueCard, { backgroundColor: COLORS.textDark }]}>
                <Text style={[styles.cardHeader, { color: COLORS.primary }]}>QUEUE CONTROLLER</Text>
                
                <View style={styles.ticketContainer}>
                  <Text style={[styles.ticketLabel, { color: COLORS.white, opacity: 0.7 }]}>
                    Now Serving
                  </Text>
                  <Text style={[styles.ticketNumber, { color: COLORS.white }]}>
                    #{servingNumber}
                  </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

                <View style={styles.queueStatusRow}>
                  <View style={styles.statusCol}>
                    <Text style={[styles.statusLabel, { color: COLORS.white, opacity: 0.6 }]}>
                      Total Booked
                    </Text>
                    <Text style={[styles.statusValue, { color: COLORS.white }]}>18 Patients</Text>
                  </View>
                  <View style={styles.statusCol}>
                    <Text style={[styles.statusLabel, { color: COLORS.white, opacity: 0.6 }]}>
                      Avg Consult
                    </Text>
                    <Text style={[styles.statusValue, { color: COLORS.primary }]}>7.2 mins</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.advanceButton}
                  activeOpacity={0.8}
                  onPress={() => setServingNumber(prev => prev + 1)}
                >
                  <Text style={styles.advanceButtonText}>Call Next Patient</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {renderScreen()}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: COLORS.bgTint,
  },
  dashboardContent: {
    padding: 24,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  subtext: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  queueCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  ticketContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  ticketLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  ticketNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginVertical: 20,
  },
  queueStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusCol: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  tipsDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  advanceButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  advanceButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default App;
