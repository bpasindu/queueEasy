import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  Animated,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import COLORS from '../theme/colors';

interface CustomInputProps extends TextInputProps {
  iconType: 'email' | 'lock' | 'user' | 'phone';
}

export const CustomInput: React.FC<CustomInputProps> = ({
  iconType,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [focusAnim] = useState(new Animated.Value(0));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (onBlur) onBlur(e);
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBorder, COLORS.primary],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.03, 0.08],
  });

  const shadowRadius = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 10],
  });

  const renderIcon = () => {
    const iconColor = isFocused ? COLORS.primary : COLORS.textMuted;

    if (iconType === 'email') {
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.icon}>
          <Rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke={iconColor}
            strokeWidth="2"
            fill="none"
          />
          <Path
            d="M3 7l9 6 9-6"
            stroke={iconColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    } else if (iconType === 'lock') {
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.icon}>
          <Rect
            x="5"
            y="11"
            width="14"
            height="10"
            rx="2"
            stroke={iconColor}
            strokeWidth="2"
            fill="none"
          />
          <Path
            d="M8 11V7a4 4 0 1 1 8 0v4"
            stroke={iconColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    } else if (iconType === 'user') {
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.icon}>
          <Path
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            stroke={iconColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle
            cx="12"
            cy="7"
            r="4"
            stroke={iconColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    } else if (iconType === 'phone') {
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" style={styles.icon}>
          <Path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            stroke={iconColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    }
    return null;
  };

  return (
    <Animated.View
      // eslint-disable-next-line react-native/no-inline-styles
      style={[
        styles.container,
        {
          borderColor,
          shadowOpacity,
          shadowRadius,
          shadowColor: COLORS.shadowColor,
          elevation: isFocused ? 4 : 1,
        },
      ]}
    >
      {renderIcon()}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={COLORS.textLight}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.textDark,
    fontSize: 16,
    paddingVertical: 0, // fix for Android height issue
  },
});

export default CustomInput;
