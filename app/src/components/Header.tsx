import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { radius, space, type, Palette } from '../theme';
import { useTheme } from '../state/ThemeContext';
import Icon from './Icon';
import { StatusDot } from './ui';
import { useApp } from '../state/AppContext';

export default function Header() {
  const { online, setShowProfile } = useApp();
  const { colors, mode, toggle } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <View style={styles.logo}>
          <Icon name="activity" size={22} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.brand}>CuraSync</Text>
          <View style={styles.syncRow}>
            <StatusDot color={online ? colors.primary : colors.warning} size={7} />
            <Text style={styles.sync}>{online ? 'Synced 2m ago' : 'Offline — start backend'}</Text>
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <Pressable testID="theme-toggle" onPress={toggle} style={styles.iconBtn}>
          <Icon name={mode === 'dark' ? 'sun' : 'moon'} size={18} color={colors.text} />
        </Pressable>
        <View style={styles.iconBtn}>
          <Icon name="bell" size={18} color={colors.text} />
        </View>
        <Pressable testID="profile-open" onPress={() => setShowProfile(true)} style={styles.avatar}>
          <Icon name="sparkle" size={16} color={colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: space.md, paddingTop: space.md, paddingBottom: space.sm,
      backgroundColor: colors.canvas,
    },
    left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logo: {
      width: 40, height: 40, borderRadius: radius.card,
      backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: colors.hairline,
    },
    brand: { ...type.headlineMd, color: colors.text },
    syncRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    sync: { ...type.bodySm, color: colors.textMuted },
    right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconBtn: {
      width: 38, height: 38, borderRadius: radius.card,
      backgroundColor: colors.surface1, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: colors.hairline,
    },
    avatar: {
      width: 38, height: 38, borderRadius: radius.full,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    },
  });
