import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import COLORS from '../../theme/colors';
import { clinics } from './constants';
import HomeTab from './HomeTab';
import BookTab from './BookTab';
import AssistTab from './AssistTab';
import ProfileTab from './ProfileTab';

interface HomeScreenProps {
  onLogout: () => void;
  userName?: string;
}

type TabType = 'Home' | 'Book' | 'Assist' | 'Profile';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onLogout,
  userName = 'Nimal Perera',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('Home');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(clinics[0]); // Default to Dr. Silva
  const [selectedSlot, setSelectedSlot] = useState<number>(4); // Default to #4

  // Interactive state for testing
  const [activeBooking, setActiveBooking] = useState({
    number: 7,
    wait: 26,
    predicted: '9:56.400000000000009 AM',
    started: '9:18 AM',
    live: true,
  });

  // Bottom Navigation Icons rendering
  const renderTabIcon = (tab: TabType, isActive: boolean) => {
    const strokeColor = isActive ? COLORS.primary : COLORS.textMuted;
    const fillValue = 'none';

    switch (tab) {
      case 'Home':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill={fillValue}>
            <Path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M9 22V12h6v10"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'Book':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill={fillValue}>
            <Rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              ry="2"
              stroke={strokeColor}
              strokeWidth="2"
            />
            <Path
              d="M16 2v4M8 2v4M3 10h18"
              stroke={strokeColor}
              strokeWidth="2"
            />
          </Svg>
        );
      case 'Assist':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill={fillValue}>
            <Path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'Profile':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill={fillValue}>
            <Path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="12"
              cy="7"
              r="4"
              stroke={strokeColor}
              strokeWidth="2"
            />
          </Svg>
        );
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <HomeTab
            userName={userName}
            activeBooking={activeBooking}
            onBookSlotPress={() => {
              setSelectedDoctor(clinics[0]);
              setActiveTab('Book');
            }}
            onClinicCardPress={(clinic) => {
              setSelectedDoctor(clinic);
              setActiveTab('Book');
            }}
          />
        );
      case 'Book':
        return (
          <BookTab
            selectedDoctor={selectedDoctor}
            setSelectedDoctor={setSelectedDoctor}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            onConfirmBooking={(slot, wait, predicted) => {
              setActiveBooking({
                number: slot,
                wait: wait,
                predicted: predicted,
                started: '9:18 AM',
                live: true,
              });
              setActiveTab('Home');
            }}
          />
        );
      case 'Assist':
        return <AssistTab />;
      case 'Profile':
        return (
          <ProfileTab
            userName={userName}
            onLogout={onLogout}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Content wrapper */}
      <View style={styles.mainContentContainer}>
        {renderActiveTabContent()}
      </View>

      {/* Custom Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {(['Home', 'Book', 'Assist', 'Profile'] as TabType[]).map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              {renderTabIcon(tab, isActive)}
              <Text
                style={[
                  styles.tabItemText,
                  isActive && styles.activeTabItemText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgTint,
  },
  mainContentContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 72,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  activeTabItemText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default HomeScreen;
