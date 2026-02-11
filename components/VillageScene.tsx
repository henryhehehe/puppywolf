import React, { useMemo, useState, useCallback, useRef } from 'react';

type VillageVariant = 'night' | 'dusk' | 'red' | 'purple' | 'green';

interface VillageSceneProps {
  variant?: VillageVariant;
}

// ── Paw print stamp that appears on click ──────────────────────────────
interface PawStamp {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

// ── Interactive floating toy ───────────────────────────────────────────
interface FloatingToy {
  id: number;
  emoji: string;
  x: number;
  y: number;
  speed: number;
  drift: number;
  size: number;
  popped: boolean;
}

const TOY_EMOJIS = ['🐾', '🎾', '🦋', '⭐', '🌸', '🧸', '💫', '🌙', '🎀', '🌈'];

const generateToy = (id: number): FloatingToy => ({
  id,
  emoji: TOY_EMOJIS[id % TOY_EMOJIS.length],
  x: 5 + ((id * 67 + 13) % 90),
  y: 8 + ((id * 43 + 29) % 75),
  speed: 15 + (id % 8) * 4,
  drift: 8 + (id % 5) * 3,
  size: 18 + (id % 4) * 4,
  popped: false,
});

// ── Cute Moon with kawaii face ──────────────────────────────────────────
const CuteMoon = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-28 sm:h-28 animate-float drop-shadow-[0_0_25px_rgba(254,243,199,0.3)]">
    <defs>
      <radialGradient id="mg" cx="45%" cy="45%" r="50%">
        <stop offset="0%" stopColor="#FEF9C3" />
        <stop offset="100%" stopColor="#FDE68A" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="40" fill="url(#mg)" />
    {/* Craters */}
    <circle cx="33" cy="38" r="7" fill="#FDE68A" opacity="0.4" />
    <circle cx="60" cy="28" r="4.5" fill="#FDE68A" opacity="0.35" />
    <circle cx="56" cy="58" r="8" fill="#FDE68A" opacity="0.25" />
    {/* Eyes */}
    <circle cx="38" cy="47" r="3.5" fill="#78350F" />
    <circle cx="56" cy="45" r="3.5" fill="#78350F" />
    <circle cx="39.5" cy="45.5" r="1.5" fill="white" />
    <circle cx="57.5" cy="43.5" r="1.5" fill="white" />
    {/* Blush */}
    <circle cx="29" cy="54" r="5" fill="#FCA5A5" opacity="0.25" />
    <circle cx="65" cy="52" r="5" fill="#FCA5A5" opacity="0.25" />
    {/* Smile */}
    <path d="M 40 55 Q 47 62 54 55" stroke="#78350F" fill="none" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ── Pine Tree SVG group (used inside <svg>) ─────────────────────────────
const PineTree = ({ x, y, h, fill = '#0a1628' }: { x: number; y: number; h: number; fill?: string }) => {
  const w = h * 0.45;
  return (
    <g>
      <polygon points={`${x},${y - h} ${x - w * 0.4},${y - h * 0.5} ${x + w * 0.4},${y - h * 0.5}`} fill={fill} />
      <polygon points={`${x},${y - h * 0.72} ${x - w * 0.55},${y - h * 0.18} ${x + w * 0.55},${y - h * 0.18}`} fill={fill} />
      <polygon points={`${x},${y - h * 0.48} ${x - w * 0.65},${y + 2} ${x + w * 0.65},${y + 2}`} fill={fill} />
      <rect x={x - 2} y={y - 2} width={4} height={5} fill={fill} />
    </g>
  );
};

// ── Cloud SVG ───────────────────────────────────────────────────────────
const CloudShape = () => (
  <svg viewBox="0 0 200 70" className="w-full h-full">
    <ellipse cx="90" cy="48" rx="55" ry="18" fill="currentColor" />
    <ellipse cx="130" cy="42" rx="38" ry="14" fill="currentColor" />
    <ellipse cx="55" cy="44" rx="30" ry="12" fill="currentColor" />
    <circle cx="100" cy="34" r="22" fill="currentColor" />
    <circle cx="128" cy="37" r="16" fill="currentColor" />
    <circle cx="68" cy="38" r="14" fill="currentColor" />
  </svg>
);

// ── Main Village Scene ──────────────────────────────────────────────────
export const VillageScene: React.FC<VillageSceneProps> = ({ variant = 'night' }) => {
  // ── Interactive state ──
  const [pawStamps, setPawStamps] = useState<PawStamp[]>([]);
  const [toys, setToys] = useState<FloatingToy[]>(() =>
    Array.from({ length: 8 }, (_, i) => generateToy(i))
  );
  const nextToyId = useRef(8);
  const nextPawId = useRef(0);

  const handleToyClick = useCallback((toyId: number) => {
    // Mark as popped (triggers animation)
    setToys(prev => prev.map(t => t.id === toyId ? { ...t, popped: true } : t));
    // After pop animation, replace with a new toy
    setTimeout(() => {
      const newId = nextToyId.current++;
      setToys(prev => prev.map(t => t.id === toyId ? generateToy(newId) : t));
    }, 800);
  }, []);

  // Phase-dependent colors
  const windowColor = useMemo(() => {
    switch (variant) {
      case 'red': return '#f87171';
      case 'purple': return '#c084fc';
      case 'green': return '#4ade80';
      default: return '#fbbf24';
    }
  }, [variant]);

  const skyGradient = useMemo(() => {
    switch (variant) {
      case 'dusk':   return 'from-indigo-950 via-slate-900 to-amber-950/30';
      case 'red':    return 'from-red-950/80 via-[#1a0808] to-[#120505]';
      case 'purple': return 'from-purple-950/80 via-[#150a25] to-[#100515]';
      case 'green':  return 'from-emerald-950/50 via-[#051a10] to-[#0a1a15]';
      default:       return 'from-indigo-950 via-[#0f1729] to-slate-900';
    }
  }, [variant]);

  const hillFill = '#111827';
  const fgFill = '#0a0e1a';
  const treeFill = '#0a1628';
  const buildingFill = '#151530';
  const roofFill = '#1e1845';
  const doorFill = '#0a0a1a';

  // Deterministic stars (no Math.random — stable across re-renders)
  const stars = useMemo(() =>
    Array.from({ length: 55 }, (_, i) => ({
      left: ((i * 73 + 17) % 100),
      top: ((i * 41 + 7) % 60),
      size: (i % 3) * 0.7 + 0.8,
      delay: (i * 0.37) % 5,
      duration: 2 + (i % 4),
    })),
  []);

  // Deterministic fireflies
  const fireflies = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      left: 15 + ((i * 67) % 70),
      top: 58 + ((i * 31) % 32),
      delay: (i * 1.3) % 8,
      duration: 4 + (i % 5),
      size: 2 + (i % 3),
    })),
  []);

  return (
    <>
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* ── Sky gradient ── */}
      <div className={`absolute inset-0 bg-gradient-to-b ${skyGradient} transition-all duration-[1500ms]`} />

      {/* ── Stars ── */}
      {stars.map((s, i) => (
        <div
          key={`s${i}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* ── Cute Moon ── */}
      <div className="absolute top-6 sm:top-10 right-[8%] sm:right-[12%] z-[1]">
        <CuteMoon />
      </div>

      {/* ── Drifting Clouds ── */}
      {[
        { top: 6, w: 180, h: 50, dur: 50, delay: 0, op: 0.06 },
        { top: 16, w: 140, h: 40, dur: 65, delay: 12, op: 0.04 },
        { top: 4, w: 160, h: 45, dur: 55, delay: 28, op: 0.055 },
        { top: 22, w: 100, h: 30, dur: 75, delay: 40, op: 0.035 },
      ].map((c, i) => (
        <div
          key={`cl${i}`}
          className="absolute text-slate-300"
          style={{
            top: `${c.top}%`,
            left: -c.w,
            width: c.w,
            height: c.h,
            opacity: c.op,
            animation: `cloud-drift ${c.dur}s ${c.delay}s linear infinite`,
          }}
        >
          <CloudShape />
        </div>
      ))}

      {/* ══════════════════════════════════════════════════════════════
          Village SVG Scene — Hills, Buildings, Trees
         ══════════════════════════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 h-[42%] sm:h-[38%]">
        <svg
          viewBox="0 0 1440 300"
          preserveAspectRatio="xMidYMax slice"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── Far rolling hill ── */}
          <path
            d="M0,190 Q200,155 400,165 Q600,128 720,122 Q900,100 1080,92 Q1280,76 1440,88 L1440,300 L0,300 Z"
            fill={hillFill}
            opacity="0.7"
          />

          {/* ────── BUILDINGS ────── */}

          {/* Cottage A (left, small cozy cottage) */}
          <g>
            <rect x="130" y="145" width="44" height="32" rx="2" fill={buildingFill} />
            <polygon points="125,147 152,116 179,147" fill={roofFill} />
            <rect x="138" y="153" width="9" height="9" rx="1.5" fill={windowColor} opacity="0.7">
              <animate attributeName="opacity" values="0.5;0.85;0.5" dur="3s" repeatCount="indefinite" />
            </rect>
            <rect x="155" y="153" width="9" height="9" rx="1.5" fill={windowColor} opacity="0.55">
              <animate attributeName="opacity" values="0.75;0.4;0.75" dur="4.2s" repeatCount="indefinite" />
            </rect>
            <rect x="148" y="163" width="10" height="14" rx="1.5" fill={doorFill} />
            {/* Flower box */}
            <rect x="137" y="162" width="11" height="2" rx="0.5" fill="#7c3aed" opacity="0.25" />
            <circle cx="139" cy="161" r="1.5" fill="#f472b6" opacity="0.3" />
            <circle cx="143" cy="161" r="1.5" fill="#fb923c" opacity="0.3" />
            <circle cx="147" cy="161" r="1.5" fill="#f472b6" opacity="0.3" />
          </g>

          {/* House B (left-center, with chimney + smoke) */}
          <g>
            <rect x="345" y="118" width="55" height="45" rx="2" fill={buildingFill} />
            <polygon points="338,120 372,80 407,120" fill={roofFill} />
            {/* Chimney */}
            <rect x="392" y="83" width="8" height="37" fill={buildingFill} />
            {/* Smoke puffs */}
            <circle r="4" fill="white" opacity="0">
              <animate attributeName="cx" values="396;398" dur="5s" repeatCount="indefinite" />
              <animate attributeName="cy" values="76;38" dur="5s" repeatCount="indefinite" />
              <animate attributeName="r" values="3;9" dur="5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.1;0" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle r="3" fill="white" opacity="0">
              <animate attributeName="cx" values="396;393" dur="6s" begin="2s" repeatCount="indefinite" />
              <animate attributeName="cy" values="73;28" dur="6s" begin="2s" repeatCount="indefinite" />
              <animate attributeName="r" values="2.5;7" dur="6s" begin="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.07;0" dur="6s" begin="2s" repeatCount="indefinite" />
            </circle>
            {/* Windows */}
            <rect x="355" y="130" width="10" height="10" rx="1.5" fill={windowColor} opacity="0.7">
              <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3.5s" repeatCount="indefinite" />
            </rect>
            <rect x="380" y="130" width="10" height="10" rx="1.5" fill={windowColor} opacity="0.55">
              <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4.5s" repeatCount="indefinite" />
            </rect>
            {/* Second floor window */}
            <rect x="363" y="122" width="8" height="6" rx="1" fill={windowColor} opacity="0.3">
              <animate attributeName="opacity" values="0.2;0.4;0.2" dur="5s" repeatCount="indefinite" />
            </rect>
            <rect x="364" y="145" width="13" height="18" rx="2" fill={doorFill} />
            <circle cx="374" cy="155" r="1" fill={windowColor} opacity="0.4" />
          </g>

          {/* Church (center, tallest — focal point) */}
          <g>
            <rect x="640" y="52" width="50" height="78" rx="2" fill={buildingFill} />
            {/* Steeple */}
            <polygon points="650,52 665,12 680,52" fill={roofFill} />
            {/* Glowing cross */}
            <line x1="665" y1="5" x2="665" y2="16" stroke={windowColor} strokeWidth="2.5" opacity="0.45">
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
            </line>
            <line x1="660" y1="10" x2="670" y2="10" stroke={windowColor} strokeWidth="2.5" opacity="0.45">
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
            </line>
            {/* Rose window */}
            <circle cx="665" cy="75" r="11" fill={windowColor} opacity="0.4">
              <animate attributeName="opacity" values="0.3;0.55;0.3" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="665" cy="75" r="8" fill="none" stroke={buildingFill} strokeWidth="2" />
            {/* Side windows */}
            <rect x="648" y="93" width="8" height="12" rx="1" fill={windowColor} opacity="0.35">
              <animate attributeName="opacity" values="0.25;0.45;0.25" dur="4s" repeatCount="indefinite" />
            </rect>
            <rect x="674" y="93" width="8" height="12" rx="1" fill={windowColor} opacity="0.35">
              <animate attributeName="opacity" values="0.4;0.25;0.4" dur="3.5s" repeatCount="indefinite" />
            </rect>
            {/* Arched door */}
            <path d="M658,130 L658,112 Q665,104 672,112 L672,130 Z" fill={doorFill} />

            {/* ── Cute owl on steeple ── */}
            <g>
              <ellipse cx="677" cy="42" rx="5" ry="6" fill={roofFill} />
              <circle cx="675" cy="40" r="2.2" fill={windowColor} opacity="0.7" />
              <circle cx="679" cy="40" r="2.2" fill={windowColor} opacity="0.7" />
              <circle cx="675" cy="40" r="1" fill={buildingFill} />
              <circle cx="679" cy="40" r="1" fill={buildingFill} />
              <polygon points="676,42.5 677,44 678,42.5" fill="#F59E0B" />
              <polygon points="672,36 674,39.5 675.5,36.5" fill={roofFill} />
              <polygon points="682,36 680,39.5 678.5,36.5" fill={roofFill} />
            </g>
          </g>

          {/* Cottage C (right-center, round/cute roof) */}
          <g>
            <rect x="890" y="78" width="42" height="30" rx="3" fill={buildingFill} />
            <path d="M886,80 Q911,50 936,80" fill={roofFill} />
            <rect x="898" y="86" width="10" height="10" rx="2" fill={windowColor} opacity="0.6">
              <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3.8s" repeatCount="indefinite" />
            </rect>
            <rect x="916" y="86" width="10" height="10" rx="2" fill={windowColor} opacity="0.45">
              <animate attributeName="opacity" values="0.65;0.35;0.65" dur="4.3s" repeatCount="indefinite" />
            </rect>
            <rect x="905" y="96" width="10" height="12" rx="1.5" fill={doorFill} />
            {/* Cat silhouette in right window */}
            <path d="M922,93 Q922,90 924,88.5 L924.5,87 L925.5,88.5 L926,87 L926,88.5 Q928,90 928,93 Z" fill={doorFill} />
            {/* Flower box */}
            <rect x="897" y="96" width="12" height="1.5" rx="0.5" fill="#7c3aed" opacity="0.2" />
          </g>

          {/* House D (far right, chimney) */}
          <g>
            <rect x="1130" y="52" width="50" height="40" rx="2" fill={buildingFill} />
            <polygon points="1124,54 1155,22 1186,54" fill={roofFill} />
            <rect x="1168" y="26" width="7" height="28" fill={buildingFill} />
            {/* Smoke */}
            <circle r="3" fill="white" opacity="0">
              <animate attributeName="cx" values="1171;1173" dur="5.5s" repeatCount="indefinite" />
              <animate attributeName="cy" values="20;-10" dur="5.5s" repeatCount="indefinite" />
              <animate attributeName="r" values="2;7" dur="5.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.08;0" dur="5.5s" repeatCount="indefinite" />
            </circle>
            <rect x="1140" y="62" width="9" height="9" rx="1.5" fill={windowColor} opacity="0.6">
              <animate attributeName="opacity" values="0.4;0.75;0.4" dur="3.2s" repeatCount="indefinite" />
            </rect>
            <rect x="1162" y="62" width="9" height="9" rx="1.5" fill={windowColor} opacity="0.5">
              <animate attributeName="opacity" values="0.6;0.35;0.6" dur="4.8s" repeatCount="indefinite" />
            </rect>
            <rect x="1148" y="75" width="12" height="17" rx="2" fill={doorFill} />
          </g>

          {/* ── Small cottage far-left edge (partially off-screen) ── */}
          <g>
            <rect x="-5" y="172" width="35" height="24" rx="2" fill={buildingFill} />
            <polygon points="-10,174 12.5,152 35,174" fill={roofFill} />
            <rect x="3" y="178" width="7" height="7" rx="1" fill={windowColor} opacity="0.4">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="5s" repeatCount="indefinite" />
            </rect>
          </g>

          {/* ── Small cottage far-right edge ── */}
          <g>
            <rect x="1370" y="80" width="38" height="26" rx="2" fill={buildingFill} />
            <polygon points="1365,82 1389,60 1413,82" fill={roofFill} />
            <rect x="1378" y="88" width="8" height="8" rx="1" fill={windowColor} opacity="0.5">
              <animate attributeName="opacity" values="0.4;0.6;0.4" dur="3.6s" repeatCount="indefinite" />
            </rect>
            <rect x="1394" y="88" width="8" height="8" rx="1" fill={windowColor} opacity="0.35">
              <animate attributeName="opacity" values="0.5;0.3;0.5" dur="4.1s" repeatCount="indefinite" />
            </rect>
          </g>

          {/* ────── TREES ────── */}
          <PineTree x={55}   y={192} h={38} fill={treeFill} />
          <PineTree x={82}   y={186} h={30} fill={treeFill} />
          <PineTree x={260}  y={168} h={35} fill={treeFill} />
          <PineTree x={290}  y={173} h={26} fill={treeFill} />
          <PineTree x={520}  y={135} h={42} fill={treeFill} />
          <PineTree x={555}  y={140} h={30} fill={treeFill} />
          <PineTree x={790}  y={106} h={30} fill={treeFill} />
          <PineTree x={820}  y={102} h={24} fill={treeFill} />
          <PineTree x={1040} y={95}  h={38} fill={treeFill} />
          <PineTree x={1068} y={99}  h={28} fill={treeFill} />
          <PineTree x={1290} y={80}  h={34} fill={treeFill} />
          <PineTree x={1316} y={84}  h={26} fill={treeFill} />
          <PineTree x={1430} y={86}  h={32} fill={treeFill} />

          {/* ── Path/road through village ── */}
          <path
            d="M300,178 C400,175 500,160 600,148 C700,136 750,132 800,130 C900,122 1000,118 1100,105"
            fill="none"
            stroke="#1a1a3a"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.15"
          />

          {/* ── Small fence posts ── */}
          {[182, 192, 202, 212, 435, 445, 455, 950, 960, 970].map((fx, fi) => {
            const fy = fx < 300 ? 170 : fx < 500 ? 157 : 103;
            return (
              <g key={`fn${fi}`} opacity="0.2">
                <rect x={fx} y={fy} width="1.5" height="7" fill={buildingFill} />
                <rect x={fx - 2} y={fy + 2} width="6" height="1" fill={buildingFill} />
              </g>
            );
          })}

          {/* ── Foreground hill ── */}
          <path
            d="M0,228 Q180,215 360,222 Q540,210 720,218 Q900,205 1080,212 Q1260,198 1440,206 L1440,300 L0,300 Z"
            fill={fgFill}
          />

          {/* Grass tufts */}
          {[50, 160, 280, 370, 490, 580, 670, 800, 890, 1020, 1120, 1260, 1380].map((gx, gi) => (
            <g key={`gr${gi}`} opacity="0.12">
              <line x1={gx} y1={224 + ((gi * 7) % 12)} x2={gx - 2} y2={218 + ((gi * 7) % 12)} stroke="#1a3a1a" strokeWidth="1" />
              <line x1={gx + 2} y1={224 + ((gi * 7) % 12)} x2={gx + 4} y2={217 + ((gi * 7) % 12)} stroke="#1a3a1a" strokeWidth="1" />
              <line x1={gx + 5} y1={225 + ((gi * 5) % 10)} x2={gx + 6} y2={219 + ((gi * 5) % 10)} stroke="#1a3a1a" strokeWidth="1" />
            </g>
          ))}
        </svg>
      </div>

      {/* ── Fireflies ── */}
      {fireflies.map((f, i) => (
        <div
          key={`ff${i}`}
          className="absolute rounded-full"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            background: `radial-gradient(circle, ${windowColor} 0%, transparent 70%)`,
            boxShadow: `0 0 ${f.size * 3}px ${windowColor}40`,
            animation: `firefly-float ${f.duration}s ${f.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* ── end of background container ── */}
    </div>

    {/* ══════════════════════════════════════════════════════════════
        Interactive Layer — z-[15], above game UI
        Container is pointer-events-none; only toys are clickable
       ══════════════════════════════════════════════════════════════ */}
    <div className="fixed inset-0 z-[15] overflow-hidden pointer-events-none">

      {/* Paw print stamps (from toy clicks) */}
      {pawStamps.map(stamp => (
        <div
          key={stamp.id}
          className="absolute pointer-events-none animate-paw-stamp"
          style={{
            left: stamp.x,
            top: stamp.y,
            transform: `translate(-50%, -50%) rotate(${stamp.rotation}deg) scale(${stamp.scale})`,
          }}
        >
          <span className="text-2xl opacity-40 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]">🐾</span>
        </div>
      ))}

      {/* Floating interactive toys */}
      {toys.map(toy => (
        <div
          key={toy.id}
          className={`absolute cursor-pointer select-none
            ${toy.popped ? 'animate-toy-pop' : 'animate-toy-float hover:scale-125'}`}
          style={{
            left: `${toy.x}%`,
            top: `${toy.y}%`,
            fontSize: toy.size,
            pointerEvents: toy.popped ? 'none' : 'auto',
            animationDuration: `${toy.speed}s`,
            ['--drift' as string]: `${toy.drift}px`,
            transition: 'transform 0.15s ease',
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Create a paw stamp where the toy was
            const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const id = nextPawId.current++;
            setPawStamps(prev => [...prev.slice(-12), {
              id, x, y,
              rotation: -30 + Math.random() * 60,
              scale: 0.6 + Math.random() * 0.5,
            }]);
            setTimeout(() => setPawStamps(prev => prev.filter(p => p.id !== id)), 2500);
            handleToyClick(toy.id);
          }}
        >
          <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">{toy.emoji}</span>
        </div>
      ))}
    </div>
    </>
  );
};
