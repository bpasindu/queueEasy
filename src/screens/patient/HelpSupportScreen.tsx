import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Linking,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import COLORS from '../../theme/colors';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'How does the AI predict my call time?',
    answer:
      "Our Random Forest model uses the doctor's actual start time, average consultation duration, and live queue length to estimate when you'll be called. Predictions refresh every few minutes.",
  },
  {
    id: '2',
    question: 'Can I cancel or change my booking?',
    answer:
      "Yes. Open your active booking from the Home or Book tab and tap 'Cancel booking'. To rebook, simply search for a new slot. Cancellations made less than 30 minutes before your predicted call time may not be eligible for a replacement slot.",
  },
  {
    id: '3',
    question: 'What if the doctor starts late?',
    answer:
      'The AI automatically detects session delays and recalculates your predicted call time. You will receive a push notification with the updated estimate as soon as the change is detected.',
  },
  {
    id: '4',
    question: "How will I know it's my turn?",
    answer:
      "You'll get a push notification when you're next in line (the patient before you is being called). The app also shows a live queue counter on your active booking card.",
  },
  {
    id: '5',
    question: 'Is my health information private?',
    answer:
      'QueueEase only collects the minimum information needed to manage your queue position. We do not store medical records, diagnoses, or prescription data. All data is encrypted in transit and at rest.',
  },
];

const AccordionItem: React.FC<{ item: FAQItem }> = ({ item }) => {
  const [open, setOpen] = useState(item.id === '1');

  return (
    <View style={[styles.accordionItem, open && styles.accordionItemOpen]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen(!open)}
        style={styles.accordionHeader}
      >
        <Text style={styles.accordionQuestion}>{item.question}</Text>
        <Svg width="18" height="18" viewBox="0 0 24 24">
          <Path
            d={open ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
            stroke={COLORS.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </TouchableOpacity>
      {open && <Text style={styles.accordionAnswer}>{item.answer}</Text>}
    </View>
  );
};

interface HelpSupportScreenProps {
  onBack: () => void;
}

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ onBack }) => {
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
        <Text style={styles.headerTitle}>Help &amp; support</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIconWrap}>
            <Svg width="28" height="28" viewBox="0 0 24 24">
              <Circle cx="12" cy="12" r="10" stroke={COLORS.white} strokeWidth="2" fill="none" />
              <Path
                d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"
                stroke={COLORS.white}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSubtitle}>Average response time: under 15 minutes</Text>
        </View>

        {/* Contact Us */}
        <Text style={styles.sectionLabel}>CONTACT US</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.contactCard}
            onPress={() => {/* Open chat */ }}
          >
            <View style={styles.contactIconWrap}>
              <Svg width="22" height="22" viewBox="0 0 24 24">
                <Path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  stroke={COLORS.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </View>
            <Text style={styles.contactLabel}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.contactCard}
            onPress={() => Linking.openURL('tel:+94112345678')}
          >
            <View style={styles.contactIconWrap}>
              <Svg width="22" height="22" viewBox="0 0 24 24">
                <Path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                  stroke={COLORS.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </View>
            <Text style={styles.contactLabel}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.contactCard}
            onPress={() => Linking.openURL('mailto:support@queueease.lk')}
          >
            <View style={styles.contactIconWrap}>
              <Svg width="22" height="22" viewBox="0 0 24 24">
                <Rect x="3" y="5" width="18" height="14" rx="2" stroke={COLORS.primary} strokeWidth="2" fill="none" />
                <Path
                  d="M3 7l9 6 9-6"
                  stroke={COLORS.primary}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text style={styles.contactLabel}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqHeaderRow}>
          <Text style={styles.sectionLabel}>FAQ</Text>
          <Svg width="20" height="20" viewBox="0 0 24 24">
            <Path
              d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
              stroke={COLORS.textMuted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>

        <View style={styles.accordionContainer}>
          {FAQ_DATA.map(item => (
            <AccordionItem key={item.id} item={item} />
          ))}
        </View>
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
  scrollContent: {
    paddingBottom: 40,
  },
  heroBanner: {
    margin: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 22,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  accordionContainer: {
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  accordionItemOpen: {
    // slight background tint when open
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  accordionQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginRight: 12,
    lineHeight: 22,
  },
  accordionAnswer: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
});

export default HelpSupportScreen;
