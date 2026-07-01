import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import COLORS from '../../theme/colors';
import api from '../../services/api';
import { slotTimes, getWaitMinutes } from './constants';

interface BookTabProps {
  clinics: any[];
  selectedDoctor: any;
  setSelectedDoctor: (doctor: any) => void;
  selectedSlot: number;
  setSelectedSlot: (slot: number) => void;
  onConfirmBooking: (slot: number, wait: number, predicted: string) => void;
}

export const BookTab: React.FC<BookTabProps> = ({
  clinics,
  selectedDoctor,
  setSelectedDoctor,
  selectedSlot,
  setSelectedSlot,
  onConfirmBooking,
}) => {
  const [slotsList, setSlotsList] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (selectedDoctor) {
      const fetchSlots = async () => {
        try {
          setLoadingSlots(true);
          const doctorId = selectedDoctor._id || selectedDoctor.id;
          const response = await api.get(`/bookings/slots/${doctorId}`);
          if (response.data.success) {
            setSlotsList(response.data.slots);
            
            // Auto-select first available slot if currently selected is taken
            const activeSelected = response.data.slots.find((s: any) => s.number === selectedSlot);
            if (!activeSelected || activeSelected.isTaken) {
              const firstAvailable = response.data.slots.find((s: any) => !s.isTaken);
              if (firstAvailable) {
                setSelectedSlot(firstAvailable.number);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching slots:', error);
          Alert.alert('Error', 'Failed to fetch queue slots. Please try again.');
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDoctor]);

  const handleReserve = async () => {
    try {
      setReserving(true);
      const doctorId = selectedDoctor._id || selectedDoctor.id;
      const response = await api.post('/bookings/reserve', {
        clinicId: doctorId,
        slotNumber: selectedSlot,
      });

      if (response.data.success) {
        Alert.alert('Booking Confirmed', `Successfully reserved Slot #${selectedSlot}!`);
        const bookingData = response.data.data;
        onConfirmBooking(bookingData.number, bookingData.wait, bookingData.predicted);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reserve slot. Please try again.';
      Alert.alert('Booking Failed', message);
    } finally {
      setReserving(false);
    }
  };
  // Render SVG icons helper functions
  const renderBackArrowIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={COLORS.textDark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const renderLockIcon = () => (
    <Svg width="10" height="10" viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="2" stroke={COLORS.textLight} strokeWidth="2" />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={COLORS.textLight} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );

  const renderCheckCircleIcon = () => (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.iconMargin8}>
      <Circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
      <Path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const renderCalendarIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={COLORS.primary} strokeWidth="2" />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={COLORS.primary} strokeWidth="2" />
    </Svg>
  );

  const renderStethoscopeIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M5 3h2M17 3h2" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" />
      <Path d="M6 3v4c0 3.31 2.69 6 6 6s6-2.69 6-6V3" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 13v4" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="12" cy="19" r="3" stroke={COLORS.white} strokeWidth="2" />
    </Svg>
  );

  if (!selectedDoctor) {
    return (
      <ScrollView contentContainerStyle={styles.tabViewPadding} showsVerticalScrollIndicator={false}>
        <Text style={styles.tabViewHeaderTitle}>Book a Clinic Slot</Text>
        <Text style={styles.tabViewSubtitle}>
          Select your favorite specialist and book a time slot to skip the waiting line.
        </Text>

        {clinics.length > 0 ? (
          clinics.map(clinic => {
            const doctorName = clinic.doctor || 'Doctor';
            const initials = doctorName.startsWith('Dr. ') 
              ? (doctorName.split(' ')[1] ? doctorName.split(' ')[1][0] : doctorName[0]) 
              : doctorName[0];

            return (
              <TouchableOpacity
                key={clinic._id || clinic.id}
                style={styles.bookingListItem}
                activeOpacity={0.85}
                onPress={() => setSelectedDoctor(clinic)}
              >
                <View style={styles.bookingListTop}>
                  <View style={styles.clinicImagePlaceholder}>
                    <Text style={styles.clinicInitials}>
                      {initials}
                    </Text>
                  </View>
                  <View style={styles.bookingListInfo}>
                    <Text style={styles.bookingDoctorName}>{clinic.doctor}</Text>
                    <Text style={styles.bookingDoctorSpecialty}>{clinic.specialty}</Text>
                    <Text style={styles.bookingDoctorLocation}>{clinic.clinic}</Text>
                  </View>
                </View>
                <View style={styles.bookingListBottom}>
                  <Text style={styles.nextAvailableText}>
                    Next available slot: Today, {clinic.actualStart || clinic.scheduledStart || '9:00 AM'}
                  </Text>
                  <View style={styles.bookingBookBtn}>
                    <Text style={styles.bookingBookBtnText}>Book Now</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={{ backgroundColor: COLORS.white, borderRadius: 24, padding: 24, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: 'rgba(229, 236, 238, 0.5)' }}>
            <Text style={{ color: COLORS.textMuted, fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 22 }}>
              No clinics are currently hosting active sessions. Please try again later once sessions start.
            </Text>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.bookingDetailContainer}>
      {/* Custom Navigation Header */}
      <View style={styles.bookingNavbar}>
        <TouchableOpacity
          style={styles.navbarBackBtn}
          onPress={() => setSelectedDoctor(null)}
          activeOpacity={0.7}
        >
          {renderBackArrowIcon()}
        </TouchableOpacity>
        <Text style={styles.bookingNavbarTitle}>Book your number</Text>
      </View>

      <ScrollView
        style={styles.bookingScroll}
        contentContainerStyle={styles.bookingScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Header Card */}
        <View style={styles.doctorHeaderCard}>
          <View style={styles.stethoscopeCircle}>
            {renderStethoscopeIcon()}
          </View>
          <View style={styles.doctorHeaderInfo}>
            <Text style={styles.doctorHeaderName}>{selectedDoctor.doctor}</Text>
            <Text style={styles.doctorHeaderSpecialty}>
              {selectedDoctor.specialty} · {selectedDoctor.clinic}
            </Text>
          </View>
          <View style={styles.openStatusBadge}>
            <Text style={styles.openStatusBadgeText}>Open</Text>
          </View>
        </View>

        {/* Scheduled vs Actual Row */}
        <View style={styles.schedActualRow}>
          <View style={styles.scheduledCard}>
            <View style={styles.schedActualHeader}>
              {renderCalendarIcon()}
              <Text style={styles.scheduledLabelText}>SCHEDULED</Text>
            </View>
            <Text style={styles.schedActualTime}>9:00 AM</Text>
            <Text style={styles.schedActualDesc}>Doctor's posted start</Text>
          </View>

          <View style={styles.actualCard}>
            <View style={styles.schedActualHeader}>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke="#2ECC71" strokeWidth="2" />
                <Path d="M12 6v6l4 2" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round" />
              </Svg>
              <Text style={styles.actualLabelText}>ACTUAL</Text>
            </View>
            <Text style={styles.schedActualTime}>9:18 AM</Text>
            <Text style={styles.schedActualDesc}>Session started today</Text>
          </View>
        </View>

        {/* Numbers Section Header */}
        <View style={styles.numbersSectionHeaderRow}>
          <Text style={styles.numbersSectionTitle}>NEXT AVAILABLE NUMBERS</Text>
          <View style={styles.aiPredictionHeader}>
            <Svg width="12" height="12" viewBox="0 0 24 24" fill="#6F8C95" style={styles.iconMargin4}>
              <Path d="M12 2c0 5.523-4.477 10-10 10 5.523 0 10 4.477 10 10 0-5.523 4.477-10 10-10-5.523 0-10-4.477-10-10z" />
            </Svg>
            <Text style={styles.aiPredictionLabel}>AI-predicted time</Text>
          </View>
        </View>

        {/* Numbers Grid */}
        {loadingSlots ? (
          <View style={{ width: '100%', height: 180, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.slotsGridContainer}>
            {slotsList.map(slot => {
              const isTaken = slot.isTaken;
              const num = slot.number;
              const isSelected = selectedSlot === num;
              const slotTime = slot.time;

              return (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.slotCard,
                    isTaken && styles.slotCardTaken,
                    isSelected && styles.slotCardSelected,
                    !isTaken && !isSelected && styles.slotCardAvailable,
                  ]}
                  disabled={isTaken}
                  onPress={() => setSelectedSlot(num)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.slotCardNoText,
                      isTaken && styles.slotCardNoTextTaken,
                      isSelected && styles.slotCardNoTextSelected,
                    ]}
                  >
                    NO.
                  </Text>

                  <Text
                    style={[
                      styles.slotCardNumberText,
                      isTaken && styles.slotCardNumberTextTaken,
                      isSelected && styles.slotCardNumberTextSelected,
                    ]}
                  >
                    {num}
                  </Text>

                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      styles.slotCardTimeText,
                      isTaken && styles.slotCardTimeTextTaken,
                      isSelected && styles.slotCardTimeTextSelected,
                    ]}
                  >
                    {slotTime}
                  </Text>

                  {isTaken && (
                    <View style={styles.lockBadgeIcon}>
                      {renderLockIcon()}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Legend Row */}
        <View style={styles.legendRowContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendLabel}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotAvailable]} />
            <Text style={styles.legendLabel}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotTaken]} />
            <Text style={styles.legendLabel}>Taken</Text>
          </View>
        </View>

        {/* Random Forest Prediction Alert Card */}
        {(() => {
          const selectedSlotData = slotsList.find(s => s.number === selectedSlot);
          const displayTime = selectedSlotData?.time || slotTimes[selectedSlot] || '9:00 AM';
          const displayWait = selectedSlotData ? selectedSlotData.wait : getWaitMinutes(selectedSlot);

          return (
            <View style={styles.rfPredictionCard}>
              <View style={styles.rfHeaderRow}>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill={COLORS.primaryDark} style={styles.iconMargin6}>
                  <Path d="M12 2c0 5.523-4.477 10-10 10 5.523 0 10 4.477 10 10 0-5.523 4.477-10 10-10-5.523 0-10-4.477-10-10z" />
                </Svg>
                <Text style={styles.rfTitleText}>Random Forest prediction</Text>
              </View>
              <Text style={styles.rfDescriptionText}>
                Number <Text style={styles.rfBoldText}>#{selectedSlot}</Text> is predicted to be served at{' '}
                <Text style={styles.rfBoldText}>{displayTime}</Text> — about <Text style={styles.rfBoldText}>{displayWait} min</Text> from now, based on today's consultation pace ({selectedDoctor.averageConsultTime || 6.4}m avg).
              </Text>
            </View>
          );
        })()}

        {/* Reservation Button */}
        <TouchableOpacity
          style={styles.reserveBtn}
          activeOpacity={0.8}
          disabled={reserving}
          onPress={handleReserve}
        >
          {reserving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              {renderCheckCircleIcon()}
              <Text style={styles.reserveBtnText}>Reserve number #{selectedSlot}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabViewPadding: {
    padding: 24,
    paddingBottom: 40,
  },
  tabViewHeaderTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  tabViewSubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: 24,
  },
  bookingListItem: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  bookingListTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clinicImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  clinicInitials: {
    color: COLORS.primaryDark,
    fontSize: 18,
    fontWeight: '700',
  },
  bookingListInfo: {
    flex: 1,
  },
  bookingDoctorName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  bookingDoctorSpecialty: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bookingDoctorLocation: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  bookingListBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  nextAvailableText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  bookingBookBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bookingBookBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // Booking details screen styles
  bookingDetailContainer: {
    flex: 1,
    backgroundColor: COLORS.bgTint,
  },
  bookingNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  navbarBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 236, 238, 0.5)',
  },
  bookingNavbarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginLeft: 16,
  },
  bookingScroll: {
    flex: 1,
  },
  bookingScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  doctorHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 236, 238, 0.5)',
    marginBottom: 20,
  },
  doctorHeaderInfo: {
    flex: 1,
    paddingLeft: 12,
  },
  doctorHeaderName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  doctorHeaderSpecialty: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  openStatusBadge: {
    backgroundColor: '#EAFAD1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  openStatusBadgeText: {
    color: '#2ECC71',
    fontSize: 12,
    fontWeight: '800',
  },
  schedActualRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  scheduledCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 236, 238, 0.8)',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  actualCard: {
    width: '48%',
    backgroundColor: '#EBFDF9',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A2F0DB',
  },
  schedActualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduledLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  actualLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2ECC71',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  schedActualTime: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  schedActualDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  numbersSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  numbersSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  aiPredictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiPredictionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  slotsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  slotCard: {
    width: '31%',
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  slotCardTaken: {
    backgroundColor: '#F0F4F7',
    borderWidth: 0,
  },
  slotCardSelected: {
    backgroundColor: COLORS.primary,
    borderWidth: 0,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  slotCardAvailable: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E5ECEE',
  },
  slotCardNoText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  slotCardNoTextTaken: {
    color: COLORS.textLight,
  },
  slotCardNoTextSelected: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  slotCardNumberText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  slotCardNumberTextTaken: {
    color: COLORS.textLight,
  },
  slotCardNumberTextSelected: {
    color: COLORS.white,
  },
  slotCardTimeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    paddingHorizontal: 4,
  },
  slotCardTimeTextTaken: {
    color: COLORS.textLight,
  },
  slotCardTimeTextSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  lockBadgeIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  legendRowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendDotAvailable: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E5ECEE',
  },
  legendDotTaken: {
    backgroundColor: '#F0F4F7',
  },
  legendLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  rfPredictionCard: {
    backgroundColor: '#E6F9F6',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C6F2EA',
    marginBottom: 24,
  },
  rfHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rfTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.2,
  },
  rfDescriptionText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    fontWeight: '500',
  },
  reserveBtn: {
    backgroundColor: '#00D2B4',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  reserveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  stethoscopeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconMargin8: { marginRight: 8 },
  iconMargin4: { marginRight: 4 },
  iconMargin6: { marginRight: 6 },
  rfBoldText: { fontWeight: '800', color: COLORS.textDark },
});

export default BookTab;
