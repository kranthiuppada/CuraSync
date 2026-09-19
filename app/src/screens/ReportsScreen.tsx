import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { radius, space, type, Palette } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import { Card, Button, SectionLabel, StatusDot, Chip } from '../components/ui';
import Icon from '../components/Icon';
import LineChart from '../components/charts/LineChart';
import RangeRows from '../components/charts/RangeRows';

const RANGES = ['Weekly', 'Monthly', 'Quarterly', 'Annual'];

function Indicator({ icon, title, sub, value, unit, chip, tone }: any) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Card style={styles.indicator}>
      <View style={styles.indIcon}><Icon name={icon} size={18} color={colors.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.indTitle}>{title}</Text>
        <Text style={styles.indSub}>{sub}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={styles.indVal}>{value}<Text style={styles.indUnit}> {unit}</Text></Text>
        <Chip label={chip} tone={tone || 'teal'} />
      </View>
    </Card>
  );
}

export default function ReportsScreen() {
  const { vitals } = useApp();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [range, setRange] = useState('Weekly');
  if (!vitals) return null;
  const bp = vitals.weeklyBP;
  const avgSys = Math.round(bp.systolic.reduce((a, b) => a + b, 0) / bp.systolic.length);
  const avgDia = Math.round(bp.diastolic.reduce((a, b) => a + b, 0) / bp.diastolic.length);

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: space.md, paddingBottom: space.xl, gap: space.md }}>
      {/* Range tabs */}
      <View style={styles.segment}>
        {RANGES.map((r) => (
          <Pressable key={r} onPress={() => setRange(r)} style={[styles.segItem, range === r && styles.segItemActive]}>
            <Text style={[styles.segText, range === r && styles.segTextActive]}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {/* BP correlation chart */}
      <Card>
        <SectionLabel>Continuous Biometric Trace</SectionLabel>
        <Text style={styles.chartTitle}>BP & Heart Rate Correlation</Text>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statLabel}>Average BP</Text>
            <Text style={styles.statVal}>{avgSys}/{avgDia}<Text style={styles.statUnit}> mmHg</Text></Text>
            <Text style={styles.statDelta}>▾ -2.4% vs prev week</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Mean Resting HR</Text>
            <Text style={styles.statVal}>65<Text style={styles.statUnit}> bpm</Text></Text>
            <Text style={[styles.statDelta, { color: colors.textMuted }]}>— Steady within norm</Text>
          </View>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}><StatusDot color={colors.secondary} /><Text style={styles.legendText}>Systolic</Text></View>
          <View style={styles.legendItem}><StatusDot color={colors.primary} /><Text style={styles.legendText}>Diastolic</Text></View>
          <View style={{ flex: 1 }} />
          <Text style={styles.corridor}>NORMATIVE CORRIDOR</Text>
        </View>
        <View style={styles.chartWell}>
          <LineChart
            testID="bp-chart"
            width={300}
            height={180}
            labels={bp.days}
            corridor={{ low: 70, high: 122 }}
            series={[
              { name: 'Systolic', color: colors.secondary, values: bp.systolic },
              { name: 'Diastolic', color: colors.primary, values: bp.diastolic },
            ]}
          />
        </View>
      </Card>

      {/* Diagnostic indicators */}
      <View style={styles.sectionHead}>
        <Icon name="trend" size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>Weekly Diagnostic Indicators</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.exportAll}>Export All</Text>
      </View>
      <Indicator icon="drop" title="Glucose In-Range" sub="Clinical Target > 70%" value="94" unit="%" chip="Optimal" />
      <Indicator icon="moon" title="Sleep Consistency" sub="Avg 7h 42m duration" value="89" unit="/100" chip="Restorative" />
      <Indicator icon="walk" title="Daily Activity" sub="Cadence: Moderate" value="8,420" unit="steps" chip="Target Met" tone="neutral" />

      {/* OCR lab results */}
      {vitals.labs && vitals.labs.length > 0 ? (
        <Card testID="lab-results">
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="report" size={16} color={colors.secondary} />
              <SectionLabel>Lab Results (OCR Extracted)</SectionLabel>
            </View>
            <Chip label={`${vitals.labs.filter((l) => l.flag !== 'normal').length} flagged`} tone="critical" />
          </View>
          <View style={{ marginTop: space.md }}>
            <RangeRows
              items={vitals.labs.map((l) => ({ name: l.name, value: l.value, unit: l.unit, low: l.refLow, high: l.refHigh, flag: l.flag }))}
              width={300}
            />
          </View>
        </Card>
      ) : (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="report" size={16} color={colors.textMuted} />
            <SectionLabel>Lab Results</SectionLabel>
          </View>
          <Text style={[styles.subtle, { marginTop: space.sm }]}>
            No lab report analyzed yet. Open Assistant → attach a lab report photo to extract and chart your values here.
          </Text>
        </Card>
      )}

      {/* Physician dossier */}
      <Card>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="shield" size={16} color={colors.primary} />
            <SectionLabel>Physician Dossier</SectionLabel>
          </View>
          <Chip label="v3.4 Signed" tone="neutral" />
        </View>
        <View style={styles.dossierRow}>
          <View style={styles.pdfIcon}><Icon name="report" size={20} color={colors.critical} /><Text style={styles.pdfSize}>1.4 MB</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dossierName}>Dr. Marcus Vance <Text style={{ color: colors.secondary, ...type.labelSm }}>Cardiology</Text></Text>
            <Text style={styles.subtle}>Multi-lead ECG rhythm strips, continuous BP logs, AI-annotated findings.</Text>
          </View>
        </View>
        <Button label="Export & Send to Physician" icon="share" variant="primary" style={{ marginTop: space.md }} />
        <Button label="Download Encrypted PDF" icon="download" variant="secondary" style={{ marginTop: space.sm }} />
      </Card>

      <View style={styles.footer}>
        <View style={styles.footerRow}><Icon name="lock" size={12} color={colors.primary} /><Text style={styles.footerText}>256-Bit E2EE · HIPAA Compliant · HL7 FHIR Certified</Text></View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.canvas },
  segment: { flexDirection: 'row', backgroundColor: colors.surface1, borderRadius: radius.card, padding: 4, borderWidth: 1, borderColor: colors.hairline },
  segItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.base },
  segItemActive: { backgroundColor: colors.surface3 },
  segText: { ...type.labelMd, color: colors.textMuted },
  segTextActive: { color: colors.text },
  chartTitle: { ...type.headlineMd, color: colors.text, marginTop: space.xs },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.md, backgroundColor: colors.surface2, borderRadius: radius.card, padding: space.md, borderWidth: 1, borderColor: colors.hairline },
  statLabel: { ...type.labelSm, color: colors.textMuted },
  statVal: { ...type.metric, color: colors.text, marginTop: 4 },
  statUnit: { ...type.bodySm, color: colors.textMuted },
  statDelta: { ...type.bodySm, color: colors.primary, marginTop: 2 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { ...type.bodySm, color: colors.text },
  corridor: { ...type.labelSm, color: colors.textMuted, backgroundColor: colors.surface2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.base },
  chartWell: { backgroundColor: colors.canvas, borderRadius: radius.card, padding: space.sm, marginTop: space.sm, borderWidth: 1, borderColor: colors.hairline, alignItems: 'center' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: space.xs },
  sectionTitle: { ...type.headlineSm, color: colors.text },
  exportAll: { ...type.labelMd, color: colors.primary },
  indicator: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  indIcon: { width: 40, height: 40, borderRadius: radius.base, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' },
  indTitle: { ...type.bodyLg, color: colors.text, fontWeight: '600' },
  indSub: { ...type.bodySm, color: colors.textMuted, marginTop: 2 },
  indVal: { ...type.headlineSm, color: colors.text },
  indUnit: { ...type.bodySm, color: colors.textMuted },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtle: { ...type.bodyMd, color: colors.textMuted },
  dossierRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md, alignItems: 'center' },
  pdfIcon: { width: 56, height: 56, borderRadius: radius.card, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.hairline },
  pdfSize: { ...type.labelSm, color: colors.textMuted, marginTop: 2 },
  dossierName: { ...type.headlineSm, color: colors.text },
  footer: { alignItems: 'center', marginTop: space.sm },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { ...type.bodySm, color: colors.textMuted },
});
