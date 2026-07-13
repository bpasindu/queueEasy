import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import COLORS from '../../theme/colors';
import api from '../../services/api';

interface Notification {
  id: string;
  type: 'next' | 'delay' | 'confirmed' | 'reminder' | 'cancelled' | 'newclinic';
  title: string;
  body: string;
  time: string;
  unread: boolean;
}


const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  const iconConfigs: Record<
    Notification['type'],
    { bg: string; iconColor: string; svg: React.ReactNode }
  > = {
    next: {
      bg: COLORS.primaryLight,
      iconColor: COLORS.primary,
      svg: (
        <Svg width="20" height="20" viewBox="0 0 24 24">
          <Path
            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
            stroke={COLORS.primary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      ),
    },
    delay: {
      bg: '#FFF8E1',
      iconColor: '#F59E0B',
      svg: (
        <Svg width="20" height="20" viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2" fill="none" />
          <Path
            d="M12 6v6l4 2"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      ),
    },
    confirmed: {
      bg: '#E8F5E9',
      iconColor: '#43A047',
      svg: (
        <Svg width="20" height="20" viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" stroke="#43A047" strokeWidth="2" fill="none" />
          <Path
            d="M8 12l3 3 5-5"
            stroke="#43A047"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      ),
    },
    reminder: {
      bg: '#E8F5E9',
      iconColor: '#43A047',
      svg: (
        <Svg width="20" height="20" viewBox="0 0 24 24">
          <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#43A047" strokeWidth="2" fill="none" />
          <Path
            d="M16 2v4M8 2v4M3 10h18"
            stroke="#43A047"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      ),
    },
    cancelled: {
      bg: '#FFF0F0',
      iconColor: '#EF5350',
      svg: (
        <Svg width="20" height="20" viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" stroke="#EF5350" strokeWidth="2" fill="none" />
          <Path
            d="M12 8v4M12 16h.01"
            stroke="#EF5350"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      ),
    },
    newclinic: {
      bg: COLORS.primaryLight,
      iconColor: COLORS.primary,
      svg: (
        <Svg width="20" height="20" viewBox="0 0 24 24">
          <Path
            d="M22 12h-4l-3 9L9 3l-3 9H2"
            stroke={COLORS.primary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      ),
    },
  };

  const config = iconConfigs[type];
  return (
    <View style={[styles.notifIconWrap, { backgroundColor: config.bg }]}>
      {config.svg}
    </View>
  );
};

interface NotificationsScreenProps {
  onBack: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      if (response.data.success) {
        const generatedNotifs: Notification[] = [];
        
        response.data.data.forEach((b: any) => {
          // Calculate relative timestamp based on createdAt
          const createdDate = new Date(b.createdAt);
          const timeDiff = Date.now() - createdDate.getTime();
          const minutesDiff = Math.max(1, Math.round(timeDiff / (1000 * 60)));
          let timeStr = `${minutesDiff}m ago`;
          if (minutesDiff >= 60) {
            const hoursDiff = Math.floor(minutesDiff / 60);
            timeStr = `${hoursDiff}h ago`;
            if (hoursDiff >= 24) {
              timeStr = `${Math.floor(hoursDiff / 24)}d ago`;
            }
          }

          // 1. Confirmed Booking Notification
          if (b.status === 'pending' || b.status === 'called' || b.status === 'completed') {
            generatedNotifs.push({
              id: `${b._id}-confirmed`,
              type: 'confirmed',
              title: `Booking confirmed — #${b.number}`,
              body: `Predicted call time ${b.predicted} for Dr. ${b.clinic?.doctor || 'Silva'} at ${b.clinic?.clinic || 'Nugegoda Clinic'}.`,
              time: timeStr,
              unread: false,
            });
          }

          // 2. Doctor Started Session Notification
          if (b.started && b.started !== '--:--') {
            generatedNotifs.push({
              id: `${b._id}-started`,
              type: 'delay',
              title: `Session started`,
              body: `Dr. ${b.clinic?.doctor || 'Silva'}'s session started at ${b.started}.`,
              time: 'Live',
              unread: true,
            });
          }

          // 3. You're Next Notification (If doctor is serving slot number - 1)
          if (b.status === 'pending' && b.clinic && b.clinic.currentServing === b.number - 1) {
            generatedNotifs.push({
              id: `${b._id}-next`,
              type: 'next',
              title: `You're next — #${b.number}`,
              body: `Dr. ${b.clinic.doctor} is serving number ${b.clinic.currentServing}. Please be ready at the clinic.`,
              time: 'Just now',
              unread: true,
            });
          }

          // 4. Completed Notification
          if (b.status === 'completed') {
            generatedNotifs.push({
              id: `${b._id}-completed`,
              type: 'reminder',
              title: `Appointment completed`,
              body: `You have successfully completed your consultation with Dr. ${b.clinic?.doctor || 'Silva'}.`,
              time: timeStr,
              unread: false,
            });
          }

          // 5. Cancelled Notification
          if (b.status === 'cancelled') {
            generatedNotifs.push({
              id: `${b._id}-cancelled`,
              type: 'cancelled',
              title: `Booking cancelled`,
              body: `Your booking #${b.number} for Dr. ${b.clinic?.doctor || 'Silva'} was cancelled.`,
              time: timeStr,
              unread: false,
            });
          }
        });

        // Sort notifications to place unread first
        generatedNotifs.sort((a, b) => {
          if (a.unread && !b.unread) return -1;
          if (!a.unread && b.unread) return 1;
          return 0;
        });

        setNotifications(generatedNotifs);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity activeOpacity={0.6} onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        ) : (
          notifications.map(notif => (
            <TouchableOpacity
              key={notif.id}
              activeOpacity={0.7}
              style={[styles.notifCard, notif.unread && styles.notifCardUnread]}
            >
              <NotificationIcon type={notif.type} />

              <View style={styles.notifBody}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifSubtext}>{notif.body}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>

              {notif.unread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
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
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  notifCardUnread: {
    backgroundColor: '#EDF8F7',
  },
  notifIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  notifBody: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  notifSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 4,
    marginLeft: 8,
    flexShrink: 0,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgTint,
  },
});

export default NotificationsScreen;
