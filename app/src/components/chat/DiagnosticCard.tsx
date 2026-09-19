import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius, space, type, Palette } from '../../theme';
import { useTheme } from '../../state/ThemeContext';
import type { Analysis } from '../../types';
import Icon from '../Icon';
import { Chip, Button, SectionLabel } from '../ui';

// The "Diagnostic Assessment" card shown under an assistant reply that carries analysis.
export default function DiagnosticCard({ analysis }: { analysis: Analysis }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const match = analysis.conditionProbability?.match ?? 0;
  return (
    <View testID="diagnostic-card" style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.assessHead}>
          <Icon name="grid" size={16} color={colors.primary} />
          <Text style={styles.assessTitle}>Diagnostic Assessment</Text>
        </View>
        <Chip label={analysis.synthesizedBy ?? 'MD Synthesized'} icon="check-circle" tone="teal" />
      </View>

      <View style={styles.probRow}>
        <SectionLabel>Condition Probability</SectionLabel>
        <Chip label={`${analysis.conditionProbability?.label ?? '—'} (${match}% match)`} tone="teal" />
      </View>
      <Text style={styles.title}>{analysis.title}</Text>

      {analysis.biometricCrossCheck ? (
        <View style={styles.crossCheck}>
          <View style={styles.ccHead}>
            <Icon name="activity" size={14} color={colors.primary} />
            <SectionLabel>Biometric Cross-Check</SectionLabel>
          </View>
          <Text style={styles.ccText}>{analysis.biometricCrossCheck}</Text>
        </View>
      ) : null}

      <SectionLabel style={{ marginTop: space.md, marginBottom: space.sm }}>Recommended Protocol</SectionLabel>
      <View style={{ gap: space.sm }}>
        {analysis.recommendedProtocol?.map((p, i) => (
          <View key={i} style={styles.protocolRow}>
            <View style={styles.protoIcon}>
              <Icon name={p.icon || 'check'} size={15} color={colors.primary} />
            </View>
            <Text style={styles.protoText}>{p.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Log · Done" icon="check" variant="primary" small style={{ flex: 1 }} />
        <Button label="Set Reminder" icon="clock" variant="secondary" small style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.hairline,
      borderRadius: radius.card, padding: space.md, marginTop: space.sm,
    },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md },
    assessHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    assessTitle: { ...type.headlineSm, color: colors.text },
    probRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
    title: { ...type.headlineMd, color: colors.text, marginBottom: space.md },
    crossCheck: {
      backgroundColor: colors.surface2, borderRadius: radius.card, padding: space.md,
      borderWidth: 1, borderColor: colors.hairline,
    },
    ccHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    ccText: { ...type.bodyMd, color: colors.text },
    protocolRow: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 10,
      backgroundColor: colors.surface2, borderRadius: radius.card, padding: space.sm,
      borderWidth: 1, borderColor: colors.hairline,
    },
    protoIcon: {
      width: 28, height: 28, borderRadius: radius.base, backgroundColor: colors.chipBg,
      alignItems: 'center', justifyContent: 'center',
    },
    protoText: { ...type.bodyMd, color: colors.text, flex: 1 },
    actions: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  });
