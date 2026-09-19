import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius, space, type, Palette } from '../../theme';
import { useTheme } from '../../state/ThemeContext';
import type { Visualization } from '../../types';
import LineChart, { LineSeries } from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import Ring from '../charts/Ring';
import RangeRows, { RangeItem } from '../charts/RangeRows';

// Inline chart card rendered under an assistant message when the turn
// carries a `visualization`. Pure SVG, dispatched by viz.type.
export default function VizCard({ viz }: { viz: Visualization }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const palette = [colors.secondary, colors.primary, colors.warning];
  const labelsFrom = (v: Visualization) => (v.series[0]?.points ?? []).map((p) => String(p.x));

  let body: React.ReactNode = null;

  if (viz.type === 'line') {
    const series: LineSeries[] = viz.series.map((s, i) => ({
      name: s.name,
      color: s.color || palette[i % palette.length],
      values: s.points.map((p) => p.y),
    }));
    body = <LineChart series={series} labels={labelsFrom(viz)} target={viz.target ?? null} width={300} height={170} testID="chat-viz-svg" />;
  } else if (viz.type === 'bar') {
    const s = viz.series[0];
    body = <BarChart data={(s?.points ?? []).map((p) => p.y)} labels={(s?.points ?? []).map((p) => String(p.x))} width={300} height={140} color={s?.color || colors.secondary} />;
  } else if (viz.type === 'gauge') {
    const s = viz.series[0];
    const val = s?.points?.[s.points.length - 1]?.y ?? 0;
    const max = viz.target ?? Math.max(val * 1.4, 100);
    body = (
      <View style={{ alignItems: 'center', paddingVertical: space.sm }}>
        <Ring value={val} max={max} size={120} stroke={11} label={`${Math.round(val)}`} sublabel={viz.unit || (viz.target ? `of ${viz.target}` : '')} />
      </View>
    );
  } else if (viz.type === 'range') {
    // For a range chart each lab is a POINT within one series; pair point[i] with bands[i].
    const pts = viz.series[0]?.points ?? [];
    const items: RangeItem[] = pts.map((p, i) => {
      const band = viz.bands?.[i] ?? viz.bands?.[0];
      const y = p.y;
      const inside = band ? y >= band.low && y <= band.high : true;
      return {
        name: String(p.x), value: y, unit: viz.unit,
        low: band?.low ?? 0, high: band?.high ?? 100,
        flag: inside ? 'normal' : y < (band?.low ?? 0) ? 'low' : 'high',
      };
    });
    body = <RangeRows items={items} width={290} />;
  }

  return (
    <View testID="chat-viz" style={styles.card}>
      <View style={styles.head}>
        <View style={styles.dot} />
        <Text style={styles.title}>{viz.title}</Text>
      </View>
      {body}
      {viz.caption ? <Text style={styles.caption}>{viz.caption}</Text> : null}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface1,
      borderWidth: 1, borderColor: colors.hairline,
      borderRadius: radius.card, padding: space.md, marginTop: space.sm,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: space.sm },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.secondary },
    title: { ...type.labelMd, color: colors.text, textTransform: 'uppercase' },
    caption: { ...type.bodySm, color: colors.textMuted, marginTop: space.sm },
  });
