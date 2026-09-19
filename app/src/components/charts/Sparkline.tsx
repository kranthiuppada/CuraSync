import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';
import { useTheme } from '../../state/ThemeContext';
import { extent, scale } from './helpers';

// ECG-style sparkline for metric cards. If `ecg` is set, injects a QRS spike.
export default function Sparkline({
  data, width = 150, height = 48, color, ecg = false,
}: {
  data: number[]; width?: number; height?: number; color?: string; ecg?: boolean;
}) {
  const { colors } = useTheme();
  const lineColor = color ?? colors.primary;
  const pad = 4;
  let series = data && data.length ? data : [1, 1, 1, 1, 1];
  if (ecg) {
    const base = series.reduce((a, b) => a + b, 0) / series.length;
    const amp = 1;
    series = [base, base, base + 0.15 * amp, base - 0.1 * amp, base + amp * 1.6, base - amp * 0.9,
      base, base + 0.25 * amp, base, base, base + 0.15 * amp, base - 0.1 * amp, base + amp * 1.6,
      base - amp * 0.9, base, base + 0.25 * amp, base, base];
  }
  const [mn, mx] = extent(series);
  const step = (width - pad * 2) / (series.length - 1);
  const pts = series.map((v, i) => ({ x: pad + i * step, y: scale(v, mn, mx, height - pad, pad) }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return (
    <Svg width={width} height={height}>
      <Line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke={colors.hairline} strokeWidth={1} />
      <Path d={d} stroke={lineColor} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
