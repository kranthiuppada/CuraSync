import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Platform, ActivityIndicator } from 'react-native';
import { radius, space, type, Palette } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useAuth } from '../state/AuthContext';
import Icon from '../components/Icon';
import { StatusDot } from '../components/ui';

export default function LoginScreen() {
  const { colors, mode, toggle } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { login, guestLogin, error } = useAuth();
  const [email, setEmail] = useState('elena@curasync.io');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    await login(email.trim(), password);
    setBusy(false);
  };
  const guest = async () => {
    setBusy(true);
    await guestLogin();
    setBusy(false);
  };

  return (
    <View style={styles.wrap}>
      <Pressable testID="theme-toggle" onPress={toggle} style={styles.themeBtn}>
        <Icon name={mode === 'dark' ? 'sun' : 'moon'} size={18} color={colors.text} />
      </Pressable>

      <View style={styles.brandWrap}>
        <View style={styles.logo}><Icon name="activity" size={34} color={colors.primary} /></View>
        <Text style={styles.brand}>CuraSync</Text>
        <Text style={styles.tagline}>Clinical AI · Medical Report Analysis</Text>
        <View style={styles.trust}>
          <StatusDot size={6} />
          <Text style={styles.trustText}>Validated by Board Certified MDs · Encrypted HIPAA</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign in to your health workspace</Text>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrap}>
          <Icon name="mail" size={16} color={colors.textMuted} />
          <TextInput
            testID="login-email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@curasync.io"
            placeholderTextColor={colors.ghost}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrap}>
          <Icon name="lock" size={16} color={colors.textMuted} />
          <TextInput
            testID="login-password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.ghost}
            secureTextEntry
            style={styles.input}
            onSubmitEditing={submit}
          />
        </View>

        {error ? (
          <View testID="login-error" style={styles.errorBox}>
            <Icon name="alert" size={14} color={colors.critical} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable testID="login-submit" onPress={submit} disabled={busy} style={styles.primaryBtn}>
          {busy ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Text style={styles.primaryText}>Sign In</Text>}
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.line} /><Text style={styles.or}>OR</Text><View style={styles.line} />
        </View>

        <Pressable testID="login-guest" onPress={guest} disabled={busy} style={styles.guestBtn}>
          <Icon name="user" size={16} color={colors.text} />
          <Text style={styles.guestText}>Continue as guest</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>256-Bit E2EE · HIPAA Compliant · HL7 FHIR</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.canvas, padding: space.lg, justifyContent: 'center' },
  themeBtn: {
    position: 'absolute', top: space.lg, right: space.lg, width: 38, height: 38,
    borderRadius: radius.card, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.hairline,
    alignItems: 'center', justifyContent: 'center',
  },
  brandWrap: { alignItems: 'center', marginBottom: space.xl },
  logo: {
    width: 72, height: 72, borderRadius: radius.section, backgroundColor: colors.surface1,
    borderWidth: 1, borderColor: colors.hairline, alignItems: 'center', justifyContent: 'center', marginBottom: space.md,
  },
  brand: { ...type.headlineXl, color: colors.text },
  tagline: { ...type.bodyMd, color: colors.textMuted, marginTop: 4 },
  trust: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.sm },
  trustText: { ...type.labelSm, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface1, borderRadius: radius.section, padding: space.lg,
    borderWidth: 1, borderColor: colors.hairline,
  },
  cardTitle: { ...type.headlineSm, color: colors.text, marginBottom: space.md },
  label: { ...type.labelMd, color: colors.textMuted, marginBottom: 6, marginTop: space.sm, textTransform: 'uppercase' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.canvas, borderRadius: radius.base, borderWidth: 1, borderColor: colors.hairlineStrong,
    paddingHorizontal: space.md, height: 46,
  },
  input: {
    flex: 1, color: colors.text, ...type.bodyMd,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: space.md,
    backgroundColor: 'rgba(220,38,38,0.10)', borderColor: colors.critical, borderWidth: 1,
    borderRadius: radius.base, padding: space.sm,
  },
  errorText: { ...type.bodySm, color: colors.critical, flex: 1 },
  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: radius.base, height: 48,
    alignItems: 'center', justifyContent: 'center', marginTop: space.lg,
  },
  primaryText: { ...type.labelLg, color: colors.onPrimary },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginVertical: space.md },
  line: { flex: 1, height: 1, backgroundColor: colors.hairline },
  or: { ...type.labelSm, color: colors.textMuted },
  guestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.surface2, borderRadius: radius.base, height: 48,
    borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  guestText: { ...type.labelLg, color: colors.text },
  footer: { ...type.labelSm, color: colors.textMuted, textAlign: 'center', marginTop: space.xl },
});
