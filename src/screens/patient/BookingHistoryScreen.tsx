import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import COLORS from '../../theme/colors';

type BookingStatus = 'Active' | 'Completed' | 'Cancelled';
type FilterTab = 'All' | BookingStatus;

interface Booking {
  id: string;
  ref: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  date: string;
  status: BookingStatus;
  queueNumber: number;
  predictedTime: string;
  actualTime: string | null;
}

const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: '1',
    ref: 'QE-2041',
    doctorName: 'Dr. Silva',
    specialty: 'General Ph...',
    clinic: 'Nugegoda Clinic',
    date: 'Today, 19 Jun',
    status: 'Active',
    queueNumber: 5,
    predictedTime: '9:54 AM',
    actualTime: null,
  },
  {
    id: '2',
    ref: 'QE-1987',
    doctorName: 'Dr. Fernando',
    specialty: 'Pe...',
    clinic: 'Maharagama Medical',
    date: '12 Jun 2026',
    status: 'Completed',
    queueNumber: 8,
    predictedTime: '10:20 AM',
    actualTime: '10:31 AM',
  },
  {
    id: '3',
    ref: 'QE-1922',
    doctorName: 'Dr. Jayasinghe',
    specialty: 'E...',
    clinic: 'Colombo 05',
    date: '28 May 2026',
    status: 'Completed',
    queueNumber: 3,
    predictedTime: '8:45 AM',
    actualTime: '8:42 AM',
  },
  {
    id: '4',
    ref: 'QE-1855',
    doctorName: 'Dr. Perera',
    specialty: 'Cardio...',
    clinic: 'Narahenpita Clinic',
    date: '10 May 2026',
    status: 'Cancelled',
    queueNumber: 12,
    predictedTime: '11:00 AM',
    actualTime: null,
  },
];

const FILTER_TABS: FilterTab[] = ['All', 'Active', 'Completed', 'Cancelled'];

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const configs: Record<BookingStatus, { bg: string; color: string; icon: React.ReactNode }> = {
    Active: {
      bg: '#E0F7F4',
      color: COLORS.primary,
      icon: (
        <Svg width="12" height="12" viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" stroke={COLORS.primary} strokeWidth="2" fill="none" />
          <Path d="M12 6v6l4 2" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" fill="none" />
        </Svg>
      ),
    },
    Completed: {
      bg: '#E8F5E9',
      color: '#43A047',
      icon: (
        <Svg width="12" height="12" viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" stroke="#43A047" strokeWidth="2" fill="none" />
          <Path d="M8 12l3 3 5-5" stroke="#43A047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      ),
    },
    Cancelled: {
      bg: '#FFF0F0',
      color: '#EF5350',
      icon: (
        <Svg width="12" height="12" viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" stroke="#EF5350" strokeWidth="2" fill="none" />
          <Path d="M15 9l-6 6M9 9l6 6" stroke="#EF5350" strokeWidth="2" strokeLinecap="round" fill="none" />
        </Svg>
      ),
    },
  };

  const cfg = configs[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      {cfg.icon}
      <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{status}</Text>
    </View>
  );
};

const DoctorAvatar: React.FC = () => (
  <View style={styles.avatarCircle}>
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={COLORS.white}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="7" r="4" stroke={COLORS.white} strokeWidth="2" fill="none" />
      {/* Stethoscope accent */}
      <Circle cx="18" cy="18" r="3" fill={COLORS.primaryLight} />
      <Path
        d="M16.5 18c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5"
        stroke={COLORS.primary}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

interface BookingHistoryScreenProps {
  onBack: () => void;
}

export const BookingHistoryScreen: React.FC<BookingHistoryScreenProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');

  const filteredBookings = activeFilter === 'All'
    ? SAMPLE_BOOKINGS
    : SAMPLE_BOOKINGS.filter(b => b.status === activeFilter);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.6} onPress={onBack} style={styles.backButton}>
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
        <Text style={styles.headerTitle}>Booking history</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.7}
            onPress={() => setActiveFilter(tab)}
            style={[
              styles.filterTab,
              activeFilter === tab && styles.filterTabActive,
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === tab && styles.filterTabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.map(booking => (
          <View key={booking.id} style={styles.bookingCard}>
            {/* Card Header Row */}
            <View style={styles.cardHeaderRow}>
              <DoctorAvatar />
              <View style={styles.cardHeaderText}>
                <Text style={styles.doctorName} numberOfLines={1}>
                  {booking.doctorName} — {booking.specialty}
                </Text>
                <Text style={styles.clinicDate} numberOfLines={1}>
                  {booking.clinic} · {booking.date}
                </Text>
              </View>
              <StatusBadge status={booking.status} />
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Number</Text>
                <Text style={styles.statValue}>#{booking.queueNumber}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Predicted</Text>
                <Text style={styles.statValueBold}>{booking.predictedTime}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Actual</Text>
                <Text style={styles.statValueBold}>
                  {booking.actualTime ?? '—'}
                </Text>
              </View>
            </View>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <Text style={styles.refText}>Ref {booking.ref}</Text>
              <TouchableOpacity activeOpacity={0.6}>
                <Text style={styles.detailsLink}>Details &gt;</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgTint,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 20,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  headerRight: {
    width: 36,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.bgTabContainer,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  cardHeaderText: {
    flex: 1,
    marginRight: 10,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 3,
  },
  clinicDate: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    flexShrink: 0,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgTint,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.inputBorder,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  statValueBold: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  detailsLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default BookingHistoryScreen;
