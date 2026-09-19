import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Line } from 'react-native-svg';
import { space, type, Palette } from '../../theme';
import { useTheme } from '../../state/ThemeContext';

export type RangeItem = {
  name: string; value: number; unit?: string;
  low: number; high: number; flag?: 'low' | 'normal' | 'high';
};

// Reference-range row: plots a value marker against its [low, high] normal band.
// Used for OCR lab results + the "range" visualization type.
export default function RangeRows({ items, width = 300 }: { items: RangeItem[]; width?: number }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const flagColor = (flag?: string) =>
    flag === 'low' ? colors.secondary : flag === 'high' ? colors.critical : colors.nominal;

  const trackW = width;
  const barH = 8;
  return (
    <View style={{ gap: space.md }}>
      {items.map((it, idx) => {
        const span = it.high - it.low || 1;
        const lo = it.low - span * 0.6;
        const hi = it.high + span * 0.6;
        const full = hi - lo || 1;
        const bandX = ((it.low - lo) / full) * trackW;
        const bandW = ((it.high - it.low) / full) * trackW;
        const markX = Math.max(3, Math.min(trackW - 3, ((it.value - lo) / full) * trackW));
        const c = flagColor(it.flag);
        return (
          <View key={idx}>
            <View style={styles.row}>
              <Text style={styles.name}>{it.name}</Text>
              <Text style={[styles.val, { color: c }]}>{it.value}<Text style={styles.unit}> {it.unit}</Text></Text>
            </View>
            <Svg width={trackW} height={barH + 8}>
              <Rect x={0} y={4} width={trackW} height={barH} rx={barH / 2} fill={colors.surface3} />
              <Rect x={bandX} y={4} width={bandW} height={barH} rx={barH / 2} fill={colors.nominal} opacity={0.28} />
              <Line x1={bandX} y1={2} x2={bandX} y2={barH + 6} stroke={colors.hairlineStrong} strokeWidth={1} />
              <Line x1={bandX + bandW} y1={2} x2={bandX + bandW} y2={barH + 6} stroke={colors.hairlineStrong} strokeWidth={1} />
              <Circle cx={markX} cy={4 + barH / 2} r={5.5} fill={c} stroke={colors.canvas} strokeWidth={2} />
            </Svg>
            <View style={styles.row}>
              <Text style={styles.ref}>Ref {it.low}–{it.high} {it.unit}</Text>
              <Text style={[styles.flag, { color: c }]}>{(it.flag ?? 'normal').toUpperCase()}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 },
    name: { ...type.bodyMd, color: colors.text, fontWeight: '600' },
    val: { ...type.bodyMd, fontWeight: '700' },
    unit: { ...type.bodySm, color: colors.textMuted, fontWeight: '400' },
    ref: { ...type.labelSm, color: colors.textMuted },
    flag: { ...type.labelSm },
  });
