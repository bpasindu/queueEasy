import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import COLORS from '../theme/colors';

interface LogoProps {
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 48 }) => {
  const strokeWidth = (size / 48) * 2.5;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        {/* Background Circle */}
        <Circle cx="24" cy="24" r="24" fill={COLORS.primary} />
        
        {/* Pulse Heartbeat Path */}
        <Path
          d="M 10 24 L 17 24 L 20 28 L 24 14 L 28 34 L 31 22 L 34 24 L 38 24"
          fill="none"
          stroke={COLORS.white}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow behind the logo
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default Logo;
