import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { type } from '../../theme';
import { useTheme } from '../../state/ThemeContext';

// Circular progress ring — Health Vitality Score and "gauge" viz.
export default function Ring({
  value, max = 100, size = 84, stroke = 8, color,
  label, sublabel, testID,
}: {
  value: number; max?: number; size?: number; stroke?: number; color?: string;
  label?: string; sublabel?: string; testID?: string;
}) {
  const { colors } = useTheme();
  const ringColor = color ?? colors.primary;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const dash = c * pct;
  const cx = size / 2;
  return (
    <View testID={testID} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cx} r={r} stroke={colors.surface3} strokeWidth={stroke} fill="none" />
        <Circle
          cx={cx} cy={cx} r={r} stroke={ringColor} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${cx} ${cx})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill as any} pointerEvents="none">
        <View style={styles.center}>
          <Text style={[type.metric, { color: colors.text }]}>{label ?? value}</Text>
          {sublabel ? <Text style={[type.labelSm, { color: colors.textMuted }]}>{sublabel}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ center: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
