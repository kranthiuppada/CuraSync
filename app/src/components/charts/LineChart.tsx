import React from 'react';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../../state/ThemeContext';
import { extent, scale, smoothPath } from './helpers';

export type LineSeries = { name: string; color: string; values: number[] };

// Multi-line smooth chart — BP/HR correlation + "line" visualization type.
export default function LineChart({
  series, labels, width = 320, height = 170, target, corridor, area = true, testID,
}: {
  series: LineSeries[]; labels: string[]; width?: number; height?: number;
  target?: number | null; corridor?: { low: number; high: number } | null;
  area?: boolean; testID?: string;
}) {
  const { colors } = useTheme();
  const padL = 8, padR = 12, padT = 12, padB = 22;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const all = series.flatMap((s) => s.values);
  if (target != null) all.push(target);
  if (corridor) all.push(corridor.low, corridor.high);
  let [mn, mx] = extent(all);
  const pad = (mx - mn) * 0.15 || 1;
  mn -= pad; mx += pad;

  const n = Math.max(1, (labels.length || series[0]?.values.length || 1) - 1);
  const xAt = (i: number) => padL + (plotW * i) / n;
  const yAt = (v: number) => padT + (plotH - scale(v, mn, mx, 0, plotH));
  const grid = [0, 0.25, 0.5, 0.75, 1];

  return (
    <Svg width={width} height={height} {...({ dataSet: { testid: testID } } as any)}>
      <Defs>
        {series.map((s, i) => (
          <LinearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={s.color} stopOpacity="0.22" />
            <Stop offset="1" stopColor={s.color} stopOpacity="0" />
          </LinearGradient>
        ))}
      </Defs>

      {corridor ? (
        <Rect x={padL} y={yAt(corridor.high)} width={plotW}
          height={Math.max(0, yAt(corridor.low) - yAt(corridor.high))}
          fill={colors.primary} opacity={0.06} />
      ) : null}

      {grid.map((g, i) => {
        const y = padT + plotH * g;
        return <Line key={i} x1={padL} y1={y} x2={padL + plotW} y2={y} stroke={colors.hairline} strokeWidth={1} />;
      })}

      {target != null ? (
        <>
          <Line x1={padL} y1={yAt(target)} x2={padL + plotW} y2={yAt(target)}
            stroke={colors.warning} strokeWidth={1.2} strokeDasharray="5 4" />
          <SvgText x={padL + plotW} y={yAt(target) - 4} fontSize="9" fill={colors.warning} textAnchor="end">
            target {target}
          </SvgText>
        </>
      ) : null}

      {series.map((s, si) => {
        const pts = s.values.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
        const d = smoothPath(pts);
        const areaD = area && pts.length > 1
          ? `${d} L ${pts[pts.length - 1].x} ${padT + plotH} L ${pts[0].x} ${padT + plotH} Z`
          : '';
        return (
          <React.Fragment key={si}>
            {area && areaD ? <Path d={areaD} fill={`url(#grad${si})`} /> : null}
            <Path d={d} stroke={s.color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={3} fill={colors.canvas} stroke={s.color} strokeWidth={2} />
            ))}
          </React.Fragment>
        );
      })}

      {labels.map((lb, i) => (
        <SvgText key={i} x={xAt(i)} y={height - 6} fontSize="9" fill={colors.textMuted} textAnchor="middle">
          {lb}
        </SvgText>
      ))}
    </Svg>
  );
}
