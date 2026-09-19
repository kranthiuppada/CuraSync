import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import { radius, space, type, Palette } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useAuth } from '../state/AuthContext';
import { useApp } from '../state/AppContext';
import Icon from '../components/Icon';
import { Card, SectionLabel, StatusDot, Chip } from '../components/ui';

export default function ProfileScreen() {
  const { colors, mode, toggle } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user, logout, saveProfile } = useAuth();
  const { vitals, setShowProfile } = useApp();

  const [name, setName] = useState(user?.name ?? '');
  const [age, setAge] = useState(String(user?.age ?? ''));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const ok = await saveProfile({ name: name.trim(), age: Number(age) || user?.age || 0 });
    setSaving(false);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 1800); }
  };

  const signOut = async () => {
    setShowProfile(false);
    await logout();
  };

  const initials = (user?.name ?? 'E').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <View testID="profile-screen" style={styles.wrap}>
      <View style={styles.topBar}>
        <Pressable testID="profile-back" onPress={() => setShowProfile(false)} style={styles.backBtn}>
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <Icon name="chevron" size={18} color={colors.text} />
          </View>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.topTitle}>Profile</Text>
        <Pressable testID="theme-toggle" onPress={toggle} style={styles.iconBtn}>
          <Icon name={mode === 'dark' ? 'sun' : 'moon'} size={18} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.md, gap: space.md, paddingBottom: space.xl }}>
        <Card>
          <View style={styles.identityRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
              <Text style={styles.email}>{user?.email ?? '—'}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                <Chip label={user?.plan ?? 'Free'} tone="teal" icon="star" />
                {user?.sex ? <Chip label={user.sex} tone="neutral" /> : null}
              </View>
            </View>
          </View>
        </Card>

        <Card>
          <SectionLabel>Edit Details</SectionLabel>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrap}>
            <Icon name="user" size={16} color={colors.textMuted} />
            <TextInput testID="profile-name" value={name} onChangeText={setName} style={styles.input} placeholderTextColor={colors.ghost} />
          </View>
          <Text style={styles.label}>Age</Text>
          <View style={styles.inputWrap}>
            <Icon name="clock" size={16} color={colors.textMuted} />
            <TextInput testID="profile-age" value={age} onChangeText={setAge} keyboardType="number-pad" style={styles.input} placeholderTextColor={colors.ghost} />
          </View>
          <Pressable testID="profile-save" onPress={save} disabled={saving} style={styles.saveBtn}>
            <Icon name={saved ? 'check' : 'edit'} size={16} color={colors.onPrimary} />
            <Text style={styles.saveText}>{saved ? 'Saved' : saving ? 'Saving…' : 'Save Changes'}</Text>
          </Pressable>
        </Card>

        <Card>
          <SectionLabel>Connected Sensors</SectionLabel>
          <View style={{ gap: space.sm, marginTop: space.sm }}>
            <View style={styles.sensorRow}>
              <StatusDot color={colors.nominal} />
              <Text style={styles.sensorName}>Apple Watch S9</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.sensorMeta}>Paired · 84%</Text>
            </View>
            <View style={styles.sensorRow}>
              <StatusDot color={colors.secondary} />
              <Text style={styles.sensorName}>Dexcom G7</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.sensorMeta}>Active · 6 days</Text>
            </View>
            <View style={styles.sensorRow}>
              <Icon name="heart" size={14} color={colors.primary} />
              <Text style={styles.sensorName}>Vitals streaming</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.sensorMeta}>{vitals?.cards.length ?? 0} channels</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View style={styles.prefRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name={mode === 'dark' ? 'moon' : 'sun'} size={16} color={colors.primary} />
              <Text style={styles.prefText}>Appearance</Text>
            </View>
            <Pressable onPress={toggle} style={styles.modePill}>
              <Text style={styles.modePillText}>{mode === 'dark' ? 'Dark' : 'Light'}</Text>
              <Icon name="chevron" size={14} color={colors.textMuted} />
            </Pressable>
          </View>
        </Card>

        <Pressable testID="profile-signout" onPress={signOut} style={styles.signOut}>
          <Icon name="logout" size={16} color={colors.critical} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.canvas },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.md, paddingVertical: space.sm,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 80 },
  backText: { ...type.labelLg, color: colors.text },
  topTitle: { ...type.headlineSm, color: colors.text },
  iconBtn: {
    width: 38, height: 38, borderRadius: radius.card, backgroundColor: colors.surface1,
    borderWidth: 1, borderColor: colors.hairline, alignItems: 'center', justifyContent: 'center',
  },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 60, height: 60, borderRadius: radius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...type.headlineMd, color: colors.onPrimary },
  name: { ...type.headlineMd, color: colors.text },
  email: { ...type.bodyMd, color: colors.textMuted, marginTop: 2 },
  label: { ...type.labelMd, color: colors.textMuted, marginTop: space.md, marginBottom: 6, textTransform: 'uppercase' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8, height: 46,
    backgroundColor: colors.canvas, borderRadius: radius.base, borderWidth: 1, borderColor: colors.hairlineStrong,
    paddingHorizontal: space.md,
  },
  input: { flex: 1, color: colors.text, ...type.bodyMd, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}) },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: radius.base, height: 46, marginTop: space.md,
  },
  saveText: { ...type.labelLg, color: colors.onPrimary },
  sensorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surface2, borderRadius: radius.card, padding: space.sm,
    borderWidth: 1, borderColor: colors.hairline,
  },
  sensorName: { ...type.bodyMd, color: colors.text, fontWeight: '600' },
  sensorMeta: { ...type.bodySm, color: colors.textMuted },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prefText: { ...type.bodyLg, color: colors.text, fontWeight: '600' },
  modePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface2, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  modePillText: { ...type.labelMd, color: colors.text },
  signOut: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(220,38,38,0.10)', borderRadius: radius.base, height: 48,
    borderWidth: 1, borderColor: colors.critical,
  },
  signOutText: { ...type.labelLg, color: colors.critical },
});
