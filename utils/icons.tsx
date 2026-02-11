// Lightweight SVG icon components — replaces lucide-react (44MB) with ~5KB.
// Each icon mirrors the lucide API: <Icon size={24} className="..." />
import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  fill?: string;
  style?: React.CSSProperties;
}

const I: React.FC<IconProps & { d: string; d2?: string; d3?: string; d4?: string }> = ({
  size = 24, className = '', strokeWidth = 2, fill = 'none', d, d2, d3, d4, style,
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
    strokeLinejoin="round" className={className} style={style}>
    <path d={d} />
    {d2 && <path d={d2} />}
    {d3 && <path d={d3} />}
    {d4 && <path d={d4} />}
  </svg>
);

// Multi-element icons need custom renders
const icon = (render: (p: IconProps) => React.ReactNode) => {
  const Comp: React.FC<IconProps> = (props) => <>{render(props)}</>;
  return Comp;
};

const svg = (size: number, sw: number, cls: string, fill: string, children: React.ReactNode) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
    strokeLinejoin="round" className={cls}>{children}</svg>
);

// ── Token Icons ──
export const CheckCircle: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </>);
};

export const XCircle: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" /><path d="m9 9 6 6" />
  </>);
};

export const HelpCircle: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>);
};

export const AlertCircle: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </>);
};

export const ThumbsDown: React.FC<IconProps> = (p) => (
  <I {...p} d="M17 14V2" d2="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
);

// ── App Icons ──
export const Crown: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
    <path d="M5 21h14" />
  </>);
};

export const ArrowRight: React.FC<IconProps> = (p) => (
  <I {...p} d="M5 12h14" d2="m12 5 7 7-7 7" />
);

export const RefreshCw: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </>);
};

export const Trophy: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </>);
};

export const Eye: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </>);
};

export const Search: React.FC<IconProps> = (p) => (
  <I {...p} d="M 11 3 a 8 8 0 1 0 0 16 8 8 0 0 0 0-16z" d2="m21 21-4.3-4.3" />
);

export const Moon: React.FC<IconProps> = (p) => (
  <I {...p} d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
);

export const Sparkles: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" /><path d="M22 5h-4" />
  </>);
};

export const Volume2: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
    <path d="M16 9a5 5 0 0 1 0 6" />
    <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
  </>);
};

export const VolumeX: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
    <line x1="22" y1="9" x2="16" y2="15" />
    <line x1="16" y1="9" x2="22" y2="15" />
  </>);
};

export const Users: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>);
};

export const Plus: React.FC<IconProps> = (p) => (
  <I {...p} d="M5 12h14" d2="M12 5v14" />
);

export const Bot: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" /><path d="M20 14h2" />
    <path d="M15 13v2" /><path d="M9 13v2" />
  </>);
};

export const Medal: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
    <path d="M11 12 5.12 2.2" /><path d="m13 12 5.88-9.8" />
    <path d="M8 7h8" />
    <circle cx="12" cy="17" r="5" />
    <path d="M12 18v-2h-.5" />
  </>);
};

export const Star: React.FC<IconProps> = (p) => (
  <I {...p} d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
);

export const PawPrint: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <circle cx="11" cy="4" r="2" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="20" cy="16" r="2" />
    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
  </>);
};

// ── GameBoard Icons ──
export const Clock: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>);
};

export const Sun: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" /><path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </>);
};

export const Send: React.FC<IconProps> = (p) => (
  <I {...p} d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" d2="m21.854 2.147-10.94 10.939" />
);

export const MessageCircle: React.FC<IconProps> = (p) => (
  <I {...p} d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
);

export const Shield: React.FC<IconProps> = (p) => (
  <I {...p} d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
);

export const Skull: React.FC<IconProps> = (p) => {
  const { size=24, className='', strokeWidth=2, fill='none' } = p;
  return svg(size, strokeWidth, className, fill, <>
    <circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" />
    <path d="M8 20v2h8v-2" />
    <path d="m12.5 17-.5-1-.5 1h1z" />
    <path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" />
  </>);
};
