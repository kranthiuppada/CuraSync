import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { space, type, Palette } from '../theme';
import { useTheme } from '../state/ThemeContext';
import Icon from './Icon';
import { useApp, TabKey } from '../state/AppContext';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'vitals', label: 'Vitals', icon: 'grid' },
  { key: 'assistant', label: 'Assistant', icon: 'sparkle' },
  { key: 'checkin', label: 'Check-in', icon: 'stethoscope' },
  { key: 'reports', label: 'Reports', icon: 'report' },
];

export default function TabBar() {
  const { tab, setTab, setShowProfile } = useApp();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.wrap}>
      {TABS.map((t) => {
        const active = tab === t.key;
        return (
          <Pressable
            key={t.key}
            testID={`tab-${t.key}`}
            onPress={() => { setShowProfile(false); setTab(t.key); }}
            style={styles.tab}
          >
            <Icon name={t.icon} size={22} color={active ? colors.primary : colors.textMuted} />
            <Text style={[styles.label, { color: active ? colors.primary : colors.textMuted }]}>{t.label}</Text>
            {active ? <View style={styles.dot} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row', backgroundColor: colors.surface1,
      borderTopWidth: 1, borderTopColor: colors.hairline,
      paddingTop: space.sm, paddingBottom: space.md,
    },
    tab: { flex: 1, alignItems: 'center', gap: 4 },
    label: { ...type.labelSm, textTransform: 'none' },
    dot: { position: 'absolute', top: -2, right: '32%', width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondary },
  });
