import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import COLORS from '../../theme/colors';
import api from '../../services/api';

export const AssistTab: React.FC = () => {
  const [assistMessages, setAssistMessages] = useState<Array<{ id: number; text: string; sender: 'user' | 'bot' }>>([
    { id: 1, text: "Hello! I am your QueueEase assistant. How can I help you today?", sender: 'bot' },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;
    const userText = inputText.trim();
    const newMsg = { id: Date.now(), text: userText, sender: 'user' as const };
    setAssistMessages(prev => [...prev, newMsg]);
    setInputText('');
    setLoading(true);

    const tempBotId = Date.now() + 1;
    setAssistMessages(prev => [...prev, { id: tempBotId, text: 'Typing...', sender: 'bot' as const }]);

    try {
      const response = await api.post('/assistant/chat', { message: userText });
      if (response.data.success) {
        setAssistMessages(prev => prev.map(m => m.id === tempBotId ? { ...m, text: response.data.reply } : m));
      } else {
        setAssistMessages(prev => prev.map(m => m.id === tempBotId ? { ...m, text: 'Sorry, I encountered an error. Please try again.' } : m));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setAssistMessages(prev => prev.map(m => m.id === tempBotId ? { ...m, text: 'Failed to reach the AI Assistant. Please check your connection.' } : m));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.assistTabContainer}>
      <View style={styles.assistHeader}>
        <Text style={styles.assistTitle}>AI Queue Assistant</Text>
        <Text style={styles.assistSubtitle}>Ask anything about live clinic waiting times</Text>
      </View>
      <ScrollView
        style={styles.assistChatScroll}
        contentContainerStyle={styles.assistChatContent}
        showsVerticalScrollIndicator={false}
      >
        {assistMessages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.chatBubble,
              msg.sender === 'user' ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text
              style={[
                styles.chatText,
                msg.sender === 'user' ? styles.userChatText : styles.botChatText,
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.assistInputArea}>
        <View style={styles.assistInputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textLight}
          />
          <TouchableOpacity
            style={styles.assistSendBtn}
            onPress={handleSendMessage}
            activeOpacity={0.8}
          >
            <Text style={styles.assistSendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  assistTabContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  assistHeader: {
    marginBottom: 16,
  },
  assistTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  assistSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  assistChatScroll: {
    flex: 1,
    marginBottom: 16,
  },
  assistChatContent: {
    paddingVertical: 8,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userChatText: {
    color: COLORS.white,
  },
  botChatText: {
    color: COLORS.textDark,
  },
  assistInputArea: {
    marginBottom: Platform.OS === 'ios' ? 8 : 16,
  },
  assistInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    height: 48,
  },
  textInput: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 14,
  },
  assistSendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistSendText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
});

export default AssistTab;
