import React from 'react';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../state/ThemeContext';
import { extent, scale } from './helpers';

// Vertical bar chart — spo2 mini display + "bar" visualization type.
export default function BarChart({
  data, labels, width = 300, height = 130, color, unit,
}: {
  data: number[]; labels?: string[]; width?: number; height?: number; color?: string; unit?: string;
}) {
  const { colors } = useTheme();
  const barColor = color ?? colors.secondary;
  const padX = 6;
  const padTop = 10;
  const padBottom = labels ? 20 : 6;
  const n = data.length || 1;
  const [mn, mx] = extent(data);
  const lo = Math.min(mn, 0) === 0 ? 0 : mn * 0.9;
  const gap = 6;
  const bw = (width - padX * 2 - gap * (n - 1)) / n;
  const baseY = height - padBottom;
  return (
    <Svg width={width} height={height}>
      <Line x1={padX} y1={baseY} x2={width - padX} y2={baseY} stroke={colors.hairline} strokeWidth={1} />
      {data.map((v, i) => {
        const h = Math.max(3, baseY - scale(v, lo, mx || 1, baseY, padTop));
        const x = padX + i * (bw + gap);
        const active = i >= n - 3;
        return (
          <React.Fragment key={i}>
            <Rect x={x} y={baseY - h} width={bw} height={h} rx={3} fill={active ? barColor : colors.surface3} />
            {labels ? (
              <SvgText x={x + bw / 2} y={height - 6} fontSize="9" fill={colors.textMuted} textAnchor="middle">
                {labels[i]}
              </SvgText>
            ) : null}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
