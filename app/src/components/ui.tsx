import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { radius, space, type, Palette } from '../theme';
import { useTheme } from '../state/ThemeContext';
import Icon from './Icon';

export function Card({
  children, style, active, testID,
}: { children: React.ReactNode; style?: ViewStyle; active?: boolean; testID?: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View testID={testID} style={[styles.card, active && styles.cardActive, style]}>
      {children}
    </View>
  );
}

export function SectionLabel({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const { colors } = useTheme();
  return <Text style={[{ ...type.labelSm, color: colors.textMuted }, style]}>{String(children).toUpperCase()}</Text>;
}

export function StatusDot({ color, size = 8 }: { color?: string; size?: number }) {
  const { colors } = useTheme();
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color ?? colors.nominal }} />;
}

export function Chip({
  label, tone = 'teal', icon, onPress, testID, active,
}: {
  label: string; tone?: 'teal' | 'critical' | 'neutral'; icon?: string;
  onPress?: () => void; testID?: string; active?: boolean;
}) {
  const { colors } = useTheme();
  const toneStyle =
    tone === 'critical'
      ? { bg: 'rgba(239,68,68,0.15)', border: colors.critical, text: colors.criticalText }
      : tone === 'neutral'
      ? { bg: colors.surface2, border: colors.hairlineStrong, text: colors.textMuted }
      : { bg: colors.chipBg, border: colors.chipBorder, text: colors.chipText };
  const Comp: any = onPress ? Pressable : View;
  return (
    <Comp
      testID={testID}
      onPress={onPress}
      style={[baseStyles.chip, { backgroundColor: toneStyle.bg, borderColor: active ? colors.primary : toneStyle.border }]}
    >
      {icon ? <Icon name={icon} size={13} color={toneStyle.text} /> : null}
      <Text style={[baseStyles.chipText, { color: toneStyle.text }]}>{label}</Text>
    </Comp>
  );
}

export function Button({
  label, onPress, variant = 'primary', icon, style, testID, small,
}: {
  label: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'destructive';
  icon?: string; style?: ViewStyle; testID?: string; small?: boolean;
}) {
  const { colors } = useTheme();
  const v =
    variant === 'primary'
      ? { bg: colors.primary, text: colors.onPrimary, border: colors.primary }
      : variant === 'destructive'
      ? { bg: 'rgba(239,68,68,0.1)', text: colors.critical, border: 'rgba(239,68,68,0.3)' }
      : { bg: colors.surface2, text: colors.text, border: colors.hairlineStrong };
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        baseStyles.btn,
        small && { paddingVertical: 8, paddingHorizontal: 12 },
        { backgroundColor: v.bg, borderColor: v.border, opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={16} color={v.text} /> : null}
      <Text style={[baseStyles.btnText, { color: v.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.hairline, marginVertical: space.md }} />;
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface1,
      borderWidth: 1,
      borderColor: colors.hairline,
      borderRadius: radius.card,
      padding: space.md,
    },
    cardActive: {
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOpacity: 0.15,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 0 },
    },
  });

// Color-independent structural styles.
const baseStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: radius.base,
    paddingVertical: 6, paddingHorizontal: 10,
  },
  chipText: { ...type.labelMd, fontWeight: '600' },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderRadius: radius.base,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  btnText: { ...type.labelLg },
});
