import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { radius, space, type, Palette } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import { Card, Button, SectionLabel, StatusDot, Chip } from '../components/ui';
import Icon from '../components/Icon';
import Ring from '../components/charts/Ring';
import Sparkline from '../components/charts/Sparkline';
import BarChart from '../components/charts/BarChart';
import type { VitalCard } from '../types';

function MetricCard({ c }: { c: VitalCard }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const iconMap: Record<string, string> = { hr: 'heart', bp: 'gauge', glucose: 'drop', spo2: 'wind' };
  return (
    <Card style={styles.metric} testID={`vital-${c.key}`}>
      <View style={styles.metricHead}>
        <SectionLabel>{c.label}</SectionLabel>
        <Icon name={iconMap[c.key] || 'activity'} size={16} color={c.key === 'hr' ? colors.critical : colors.secondary} />
      </View>
      <Text style={styles.metricSub}>{c.sub}</Text>
      <View style={styles.metricValRow}>
        <Text style={styles.metricVal}>{c.value}</Text>
        <Text style={styles.metricUnit}>{c.unit}</Text>
      </View>
      <View style={styles.metricChart}>
        {c.key === 'hr' && <Sparkline data={c.series || []} ecg width={150} height={40} color={colors.primary} />}
        {c.key === 'glucose' && <Sparkline data={c.series || []} width={150} height={40} color={colors.secondary} />}
        {c.key === 'spo2' && <BarChart data={c.series || [96, 97, 97, 98, 97, 98, 98]} width={150} height={40} color={colors.secondary} />}
        {c.key === 'bp' && (
          <Svg width={150} height={40}>
            <Rect x={0} y={16} width={150} height={7} rx={4} fill={colors.surface3} />
            <Rect x={0} y={16} width={95} height={7} rx={4} fill={colors.primary} />
          </Svg>
        )}
      </View>
      <View style={styles.metricStatus}>
        <StatusDot color={colors.nominal} />
        <Text style={styles.metricStatusText}>{c.status}</Text>
      </View>
    </Card>
  );
}

export default function VitalsScreen() {
  const { vitals } = useApp();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  if (!vitals) return null;
  const hs = vitals.healthScore;

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: space.md, paddingBottom: space.xl, gap: space.md }}>
      {/* Patient overview hero */}
      <Card testID="health-score">
        <View style={styles.overviewTop}>
          <SectionLabel>Patient Overview</SectionLabel>
          <Chip label={hs.status} tone="teal" icon="check-circle" />
        </View>
        <Text style={styles.greeting}>Good morning, Elena</Text>
        <Text style={styles.subtle}>All biometrics calibrated & within baseline</Text>
        <View style={styles.scoreRow}>
          <Ring value={hs.value} max={100} size={92} stroke={9} label={`${hs.value}`} sublabel="/100" />
          <View style={{ flex: 1, marginLeft: space.md }}>
            <Text style={styles.scoreTitle}>Health Vitality Score</Text>
            <Text style={styles.scoreDelta}>+{hs.delta} pts vs. 7-day average</Text>
          </View>
          <Button label="Details" icon="chevron" variant="secondary" small />
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actionRow}>
        <Button label="Log Reading" icon="plus" variant="secondary" style={{ flex: 1 }} />
        <Button label="Share" icon="share" variant="secondary" style={{ flex: 1 }} />
        <Button label="Emergency" icon="alert" variant="destructive" style={{ flex: 1 }} />
      </View>

      {/* Telemetry */}
      <View style={styles.sectionHead}>
        <Icon name="trend" size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>Real-Time Telemetry</Text>
        <View style={{ flex: 1 }} />
        <StatusDot color={colors.secondary} />
        <Text style={styles.live}>Live Feed</Text>
      </View>
      <View style={styles.grid}>
        {vitals.cards.map((c) => <MetricCard key={c.key} c={c} />)}
      </View>

      {/* Sleep architecture */}
      <Card>
        <View style={styles.sleepHead}>
          <Icon name="moon" size={16} color={colors.secondary} />
          <SectionLabel>Sleep Architecture & Recovery</SectionLabel>
          <View style={{ flex: 1 }} />
          <Chip label={`${vitals.sleep.efficiency}% Efficiency`} tone="teal" />
        </View>
        <View style={styles.sleepDuration}>
          <Text style={styles.sleepBig}>{vitals.sleep.duration}</Text>
          <Text style={styles.sleepLabel}>Total Duration · Target met (+42m)</Text>
        </View>
        <Svg width="100%" height={10} style={{ marginVertical: space.sm }}>
          <Rect x="0" y="0" width="100%" height="10" rx="5" fill={colors.surface3} />
          <Rect x="0" y="0" width="26%" height="10" rx="5" fill={colors.primary} />
          <Rect x="26%" y="0" width="24%" height="10" fill={colors.secondary} />
        </Svg>
        <View style={styles.sleepLegend}>
          <View style={styles.legendItem}><StatusDot color={colors.primary} /><Text style={styles.legendText}>Deep {vitals.sleep.deep}</Text></View>
          <View style={styles.legendItem}><StatusDot color={colors.secondary} /><Text style={styles.legendText}>REM {vitals.sleep.rem}</Text></View>
          <View style={styles.legendItem}><StatusDot color={colors.ghost} /><Text style={styles.legendText}>Core {vitals.sleep.core}</Text></View>
        </View>
      </Card>

      {/* Scheduled regimen */}
      <Card>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="pill" size={16} color={colors.primary} />
            <SectionLabel>Scheduled Regimen</SectionLabel>
          </View>
          <Text style={styles.smallMuted}>Today, 12:30 PM</Text>
        </View>
        <Text style={styles.regimenTitle}>Omega-3 & Metformin</Text>
        <Text style={styles.subtle}>500mg · With lunch (post-prandial)</Text>
      </Card>

      {/* Sensors */}
      <Card>
        <View style={styles.rowBetween}>
          <SectionLabel>Synchronized Sensors</SectionLabel>
          <Text style={[styles.smallMuted, { color: colors.primary }]}>Manage</Text>
        </View>
        <View style={styles.sensorRow}>
          <View style={styles.sensor}>
            <Text style={styles.sensorName}>Apple Watch S9</Text>
            <View style={styles.legendItem}><StatusDot color={colors.nominal} /><Text style={styles.legendText}>Paired · 84%</Text></View>
          </View>
          <View style={styles.sensor}>
            <Text style={styles.sensorName}>Dexcom G7</Text>
            <View style={styles.legendItem}><StatusDot color={colors.secondary} /><Text style={styles.legendText}>Active · 6 days</Text></View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.canvas },
  overviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { ...type.headlineLg, color: colors.text, marginTop: space.sm },
  subtle: { ...type.bodyMd, color: colors.textMuted, marginTop: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.md, backgroundColor: colors.surface2, borderRadius: radius.card, padding: space.sm, borderWidth: 1, borderColor: colors.hairline },
  scoreTitle: { ...type.bodyLg, color: colors.text, fontWeight: '600' },
  scoreDelta: { ...type.bodySm, color: colors.textMuted, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: space.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: space.xs },
  sectionTitle: { ...type.headlineSm, color: colors.text },
  live: { ...type.labelSm, color: colors.secondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  metric: { width: '48.5%', padding: space.sm },
  metricHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricSub: { ...type.bodySm, color: colors.textMuted, marginTop: 2 },
  metricValRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: space.xs },
  metricVal: { ...type.metric, color: colors.text },
  metricUnit: { ...type.bodySm, color: colors.textMuted, marginBottom: 4 },
  metricChart: { marginTop: space.xs, height: 42, overflow: 'hidden' },
  metricStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.xs, backgroundColor: colors.surface2, borderRadius: radius.base, paddingHorizontal: 8, paddingVertical: 5, alignSelf: 'flex-start' },
  metricStatusText: { ...type.labelSm, color: colors.text },
  sleepHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sleepDuration: { marginTop: space.sm },
  sleepBig: { ...type.metricLg, color: colors.text },
  sleepLabel: { ...type.bodySm, color: colors.textMuted },
  sleepLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { ...type.bodySm, color: colors.text },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallMuted: { ...type.labelSm, color: colors.textMuted },
  regimenTitle: { ...type.headlineSm, color: colors.text, marginTop: space.sm },
  sensorRow: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  sensor: { flex: 1, backgroundColor: colors.surface2, borderRadius: radius.card, padding: space.sm, borderWidth: 1, borderColor: colors.hairline },
  sensorName: { ...type.bodyMd, color: colors.text, fontWeight: '600', marginBottom: 4 },
});
