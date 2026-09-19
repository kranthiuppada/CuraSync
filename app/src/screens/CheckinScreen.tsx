import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { radius, space, type, Palette } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import { Card, Button, SectionLabel, StatusDot, Chip } from '../components/ui';
import Icon from '../components/Icon';

const REGIONS = [
  { key: 'head', label: 'Head & Neck', icon: 'stretch' },
  { key: 'chest', label: 'Chest & Heart', icon: 'heart' },
  { key: 'abdomen', label: 'Abdomen', icon: 'grid' },
  { key: 'joints', label: 'Joints & Limbs', icon: 'walk' },
];
const DURATIONS = ['< 1 hour', '1–3 hours', 'All day'];

export default function CheckinScreen() {
  const { sendMessage, setTab } = useApp();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [region, setRegion] = useState('head');
  const [pain, setPain] = useState(2);
  const [duration, setDuration] = useState('1–3 hours');

  const complete = () => {
    const r = REGIONS.find((x) => x.key === region)?.label ?? 'Head & Neck';
    sendMessage(
      `Daily check-in: ${r} discomfort, pain intensity ${pain}/10, episode duration ${duration}. Please assess and advise.`,
    );
    setTab('assistant');
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: space.md, paddingBottom: space.xl, gap: space.md }}>
      <Card>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="report" size={15} color={colors.primary} />
            <SectionLabel>Thursday, Oct 24</SectionLabel>
          </View>
          <Chip label="Step 2 of 3" tone="teal" icon="check-circle" />
        </View>
        <Text style={styles.title}>Daily Wellness Check-in</Text>
        <Text style={styles.subtle}>Log current symptoms for adaptive care telemetry</Text>
        <Svg width="100%" height={6} style={{ marginTop: space.sm }}>
          <Rect x="0" y="0" width="100%" height="6" rx="3" fill={colors.surface3} />
          <Rect x="0" y="0" width="66%" height="6" rx="3" fill={colors.secondary} />
        </Svg>
      </Card>

      {/* Anatomical focus */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: space.sm }}>
          <Icon name="stretch" size={16} color={colors.primary} />
          <View>
            <Text style={styles.cardHeading}>Anatomical Focus Area</Text>
            <Text style={styles.subtle}>Select affected anatomical region</Text>
          </View>
        </View>
        <View style={styles.grid}>
          {REGIONS.map((r) => {
            const active = region === r.key;
            return (
              <Pressable
                key={r.key}
                testID={`region-${r.key}`}
                onPress={() => setRegion(r.key)}
                style={[styles.region, active && styles.regionActive]}
              >
                <Icon name={r.icon} size={18} color={active ? colors.onPrimary : colors.text} />
                <Text style={[styles.regionText, active && { color: colors.onPrimary }]}>{r.label}</Text>
                {active ? <Icon name="check-circle" size={16} color={colors.onPrimary} /> : null}
              </Pressable>
            );
          })}
        </View>

        {/* Pain scale */}
        <Text style={[styles.cardHeading, { marginTop: space.md }]}>Pain Intensity Scale</Text>
        <View style={styles.scaleRow}>
          {Array.from({ length: 11 }).map((_, i) => (
            <Pressable key={i} testID={`pain-${i}`} onPress={() => setPain(i)} style={styles.tickWrap}>
              <View style={[styles.tick, i <= pain && styles.tickActive, i === pain && styles.tickCurrent]} />
            </Pressable>
          ))}
        </View>
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>0 (None)</Text>
          <Text style={[styles.scaleLabel, { color: colors.primary }]}>{pain} - {pain <= 3 ? 'Mild' : pain <= 6 ? 'Moderate' : 'Severe'}</Text>
          <Text style={styles.scaleLabel}>10 (Severe)</Text>
        </View>

        {/* Duration */}
        <Text style={[styles.cardHeading, { marginTop: space.md }]}>Episode Duration</Text>
        <View style={styles.durationRow}>
          {DURATIONS.map((d) => (
            <Pressable key={d} onPress={() => setDuration(d)} style={[styles.durItem, duration === d && styles.durActive]}>
              <Text style={[styles.durText, duration === d && { color: colors.onPrimary }]}>{d}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Hydration */}
      <Card>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="drop" size={16} color={colors.secondary} />
            <View>
              <Text style={styles.cardHeading}>Hydration Target</Text>
              <Text style={styles.subtle}>Recommended 35ml/kg baseline</Text>
            </View>
          </View>
          <Text style={[styles.pct, { color: colors.secondary }]}>66%</Text>
        </View>
        <View style={styles.hydroRow}>
          <Text style={styles.hydroBig}>1,450<Text style={styles.subtle}> / 2,200 ml</Text></Text>
          <Text style={styles.subtle}>750 ml remaining</Text>
        </View>
        <Svg width="100%" height={8} style={{ marginTop: space.sm }}>
          <Rect x="0" y="0" width="100%" height="8" rx="4" fill={colors.surface3} />
          <Rect x="0" y="0" width="66%" height="8" rx="4" fill={colors.secondary} />
        </Svg>
      </Card>

      {/* Medication */}
      <Card>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="pill" size={16} color={colors.primary} />
            <View>
              <Text style={styles.cardHeading}>Medication Adherence</Text>
              <Text style={styles.subtle}>Lisinopril 10mg & CoQ10</Text>
            </View>
          </View>
          <Chip label="100% On Schedule" tone="teal" />
        </View>
        <View style={styles.medRow}>
          <Icon name="check-circle" size={16} color={colors.nominal} />
          <Text style={styles.medText}>Morning Dose Confirmed</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.subtle}>Taken 8:15 AM</Text>
        </View>
      </Card>

      {/* Cardio load */}
      <Card>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="heart" size={16} color={colors.critical} />
            <Text style={styles.cardHeading}>Cardiovascular Load Forecast</Text>
          </View>
          <Chip label="Zone 2 Rec." tone="teal" />
        </View>
        <Text style={[styles.subtle, { marginTop: 4 }]}>HRV Balance: 58ms (Restored)</Text>
        <View style={styles.forecast}>
          <Icon name="walk" size={16} color={colors.primary} />
          <Text style={styles.forecastText}>
            Optimal for light exercise today. Sustained Zone 2 cardio recommended for 30 minutes before 18:00.
          </Text>
        </View>
      </Card>

      <Button testID="complete-checkin" label="Complete Daily Log & Sync with AI Advisor" icon="check-circle" variant="primary" onPress={complete} />
      <View style={styles.footerRow}>
        <Icon name="lock" size={12} color={colors.textMuted} />
        <Text style={styles.subtle}>Encrypted HIPAA & HL7-FHIR Telemetry Pipe</Text>
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.canvas },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...type.headlineLg, color: colors.text, marginTop: space.sm },
  subtle: { ...type.bodySm, color: colors.textMuted },
  cardHeading: { ...type.bodyLg, color: colors.text, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  region: { width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface2, borderRadius: radius.card, padding: space.md, borderWidth: 1, borderColor: colors.hairline },
  regionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  regionText: { ...type.bodyMd, color: colors.text, fontWeight: '600', flex: 1 },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space.sm },
  tickWrap: { padding: 4 },
  tick: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.surface3 },
  tickActive: { backgroundColor: colors.primary },
  tickCurrent: { transform: [{ scale: 1.4 }], backgroundColor: colors.primaryBright },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.xs },
  scaleLabel: { ...type.labelSm, color: colors.textMuted },
  durationRow: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  durItem: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: colors.surface2, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline },
  durActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  durText: { ...type.bodyMd, color: colors.text, fontWeight: '600' },
  pct: { ...type.headlineSm },
  hydroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: space.sm },
  hydroBig: { ...type.metric, color: colors.text },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: space.sm, backgroundColor: colors.surface2, borderRadius: radius.card, padding: space.sm, borderWidth: 1, borderColor: colors.hairline },
  medText: { ...type.bodyMd, color: colors.text, fontWeight: '600' },
  forecast: { flexDirection: 'row', gap: 10, marginTop: space.sm, backgroundColor: colors.surface2, borderRadius: radius.card, padding: space.md, borderWidth: 1, borderColor: colors.hairline },
  forecastText: { ...type.bodyMd, color: colors.text, flex: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
});
