import React from 'react';
import Svg, { Path, Circle, Polyline, Rect, Line } from 'react-native-svg';
import { useTheme } from '../state/ThemeContext';

type Props = { name: string; size?: number; color?: string };

// Minimal stroke-based icon set (Feather-ish), hand-drawn so we need no icon lib.
export default function Icon({ name, size = 20, color }: Props) {
  const { colors } = useTheme();
  const s = size;
  const stroke = color ?? colors.text;
  const sw = 1.8;
  const common = { stroke, strokeWidth: sw, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24">
      {name === 'heart' && <Path {...common} d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />}
      {name === 'activity' && <Polyline {...common} points="22 12 18 12 15 21 9 3 6 12 2 12" />}
      {name === 'water' && <Path {...common} d="M12 2.7S6 9.4 6 14a6 6 0 0 0 12 0c0-4.6-6-11.3-6-11.3z" />}
      {name === 'stretch' && <><Circle {...common} cx="12" cy="4.5" r="2" /><Path {...common} d="M12 7v6M12 9l-5 2M12 9l5 2M9 20l3-6 3 6" /></>}
      {name === 'clock' && <><Circle {...common} cx="12" cy="12" r="9" /><Polyline {...common} points="12 7 12 12 16 14" /></>}
      {name === 'chart' && <><Line {...common} x1="4" y1="20" x2="4" y2="10" /><Line {...common} x1="10" y1="20" x2="10" y2="4" /><Line {...common} x1="16" y1="20" x2="16" y2="13" /><Line {...common} x1="21" y1="20" x2="3" y2="20" /></>}
      {name === 'trend' && <><Polyline {...common} points="3 17 9 11 13 15 21 7" /><Polyline {...common} points="15 7 21 7 21 13" /></>}
      {name === 'bell' && <Path {...common} d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />}
      {name === 'plus' && <><Line {...common} x1="12" y1="5" x2="12" y2="19" /><Line {...common} x1="5" y1="12" x2="19" y2="12" /></>}
      {name === 'send' && <><Line {...common} x1="22" y1="2" x2="11" y2="13" /><Path {...common} d="M22 2 15 22l-4-9-9-4 20-7z" /></>}
      {name === 'mic' && <><Rect {...common} x="9" y="2" width="6" height="12" rx="3" /><Path {...common} d="M5 10a7 7 0 0 0 14 0M12 17v4" /></>}
      {name === 'attach' && <Path {...common} d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L10 17.5a1.7 1.7 0 0 1-2.3-2.3l7.8-7.8" />}
      {name === 'shield' && <Path {...common} d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z" />}
      {name === 'moon' && <Path {...common} d="M21 12.8A8 8 0 1 1 11.2 3 6.3 6.3 0 0 0 21 12.8z" />}
      {name === 'sun' && <><Circle {...common} cx="12" cy="12" r="4.2" /><Path {...common} d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></>}
      {name === 'logout' && <Path {...common} d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M15 12H5" />}
      {name === 'edit' && <Path {...common} d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />}
      {name === 'mail' && <><Rect {...common} x="3" y="5" width="18" height="14" rx="2" /><Path {...common} d="m3 7 9 6 9-6" /></>}
      {name === 'user' && <><Circle {...common} cx="12" cy="8" r="4" /><Path {...common} d="M4 21a8 8 0 0 1 16 0" /></>}
      {name === 'star' && <Path {...common} d="M12 3l2.6 6.3L21 10l-5 4 1.5 7L12 17.5 6.5 21 8 14l-5-4 6.4-.7L12 3z" />}
      {name === 'pill' && <><Rect {...common} x="3" y="8" width="18" height="8" rx="4" transform="rotate(-45 12 12)" /><Line {...common} x1="8.5" y1="8.5" x2="15.5" y2="15.5" /></>}
      {name === 'drop' && <Path {...common} d="M12 2.7S6 9.4 6 14a6 6 0 0 0 12 0c0-4.6-6-11.3-6-11.3z" />}
      {name === 'gauge' && <><Path {...common} d="M4 18a8 8 0 1 1 16 0" /><Line {...common} x1="12" y1="14" x2="16" y2="10" /></>}
      {name === 'wind' && <Path {...common} d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h9a3 3 0 1 1-3 3" />}
      {name === 'check' && <Polyline {...common} points="20 6 9 17 4 12" />}
      {name === 'check-circle' && <><Circle {...common} cx="12" cy="12" r="9" /><Polyline {...common} points="16 9.5 11 14.5 8 11.5" /></>}
      {name === 'grid' && <><Rect {...common} x="3" y="3" width="7" height="7" rx="1" /><Rect {...common} x="14" y="3" width="7" height="7" rx="1" /><Rect {...common} x="3" y="14" width="7" height="7" rx="1" /><Rect {...common} x="14" y="14" width="7" height="7" rx="1" /></>}
      {name === 'sparkle' && <Path {...common} d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />}
      {name === 'stethoscope' && <Path {...common} d="M6 3v5a4 4 0 0 0 8 0V3M10 16a4 4 0 0 0 8 0v-2M18 12a2 2 0 1 0 0 .01" />}
      {name === 'report' && <><Path {...common} d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" /><Polyline {...common} points="14 3 14 8 19 8" /><Line {...common} x1="9" y1="13" x2="15" y2="13" /><Line {...common} x1="9" y1="17" x2="13" y2="17" /></>}
      {name === 'share' && <><Circle {...common} cx="18" cy="5" r="3" /><Circle {...common} cx="6" cy="12" r="3" /><Circle {...common} cx="18" cy="19" r="3" /><Line {...common} x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><Line {...common} x1="15.4" y1="6.5" x2="8.6" y2="10.5" /></>}
      {name === 'alert' && <><Path {...common} d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><Line {...common} x1="12" y1="9" x2="12" y2="13" /><Line {...common} x1="12" y1="17" x2="12" y2="17" /></>}
      {name === 'info' && <><Circle {...common} cx="12" cy="12" r="9" /><Line {...common} x1="12" y1="11" x2="12" y2="16" /><Line {...common} x1="12" y1="8" x2="12" y2="8" /></>}
      {name === 'download' && <><Path {...common} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><Polyline {...common} points="7 10 12 15 17 10" /><Line {...common} x1="12" y1="15" x2="12" y2="3" /></>}
      {name === 'lock' && <><Rect {...common} x="4" y="11" width="16" height="10" rx="2" /><Path {...common} d="M8 11V7a4 4 0 0 1 8 0v4" /></>}
      {name === 'chevron' && <Polyline {...common} points="9 6 15 12 9 18" />}
      {name === 'close' && <><Line {...common} x1="6" y1="6" x2="18" y2="18" /><Line {...common} x1="18" y1="6" x2="6" y2="18" /></>}
      {name === 'search' && <><Circle {...common} cx="11" cy="11" r="7" /><Line {...common} x1="16" y1="16" x2="21" y2="21" /></>}
      {name === 'expand' && <><Polyline {...common} points="15 3 21 3 21 9" /><Polyline {...common} points="9 21 3 21 3 15" /><Line {...common} x1="21" y1="3" x2="14" y2="10" /><Line {...common} x1="3" y1="21" x2="10" y2="14" /></>}
      {name === 'walk' && <><Circle {...common} cx="13" cy="4" r="2" /><Path {...common} d="M13 7l-2 4 3 2 1 6M11 11l-4 2M14 13l2 3" /></>}
    </Svg>
  );
}
