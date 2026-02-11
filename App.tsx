import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { GamePhase, GameState, TokenType, Role, RoomInfo, Difficulty, ReactionEvent } from './types';
import { gameService } from './services/game';
import { audioService } from './services/audioService';
import { RoleCard } from './components/ui/RoleCard';
import { GameBoard } from './components/GameBoard';
import { PlayerCircle } from './components/PlayerCircle';
import { VillageScene } from './components/VillageScene';
import { Crown, ArrowRight, RefreshCw, Trophy, Eye, Search, Moon, Sparkles, Volume2, VolumeX, Users, Plus, Bot, Medal, Star, PawPrint, Clock } from './utils/icons';
import { getPuppyAvatarUrl, getPuppySvgMarkup, PUPPY_BREED_NAMES, BREED_LABELS, getBreedEarType, getBreedHasTongue } from './utils/puppyAvatar';

// ─── Reaction emojis available ──────────────────────────────────────
const REACTION_EMOJIS = ['🤨', '😂', '😱', '🤔', '❤️', '🐾', '🐺', '🦴'];

// ─── Achievement display config ─────────────────────────────────────
const ACHIEVEMENT_CONFIG: Record<string, { icon: string; label: string }> = {
  'First Blood': { icon: '🎯', label: 'First Blood' },
  'Sherlock': { icon: '🔍', label: 'Sherlock' },
  'Master of Disguise': { icon: '🎭', label: 'Master of Disguise' },
  'Pack Leader': { icon: '👑', label: 'Pack Leader' },
  'Eagle Eye': { icon: '🦅', label: 'Eagle Eye' },
  'Howl at the Moon': { icon: '🌙', label: 'Howl at the Moon' },
};

// ─── Difficulty labels ──────────────────────────────────────────────
const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; emoji: string; color: string }> = {
  EASY: { label: 'Puppy', emoji: '🐶', color: 'from-green-500 to-emerald-500' },
  MEDIUM: { label: 'Good Boy', emoji: '🐕', color: 'from-amber-500 to-orange-500' },
  HARD: { label: 'Alpha Wolf', emoji: '🐺', color: 'from-red-500 to-pink-500' },
};

// ─── Avatar options (puppy breeds!) ─────────────────────────────────────
const AVATAR_SEEDS = PUPPY_BREED_NAMES;

const getAvatarUrl = (seed: string) => getPuppyAvatarUrl(seed);

// ─── Enhanced Confetti (gold for winners, silver for everyone) ────────
const Confetti: React.FC<{ variant?: 'gold' | 'silver' }> = ({ variant = 'gold' }) => {
  const pieces = useMemo(() => {
    const colors = variant === 'gold'
      ? ['#fbbf24', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#fef3c7', '#f97316']
      : ['#94a3b8', '#64748b', '#475569', '#6366f1', '#8b5cf6', '#a78bfa'];
    return Array.from({ length: 50 }, (_, i) => ({
      left: ((i * 31 + 7) % 100),
      delay: (i * 0.05) % 2.5,
      duration: 1.5 + (i % 5),
      color: colors[i % colors.length],
      size: 3 + (i % 6),
      shape: i % 3, // 0=square, 1=circle, 2=tall
    }));
  }, [variant]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.shape === 2 ? p.size * 2.5 : p.size * 1.2,
            backgroundColor: p.color,
            borderRadius: p.shape === 1 ? '50%' : '1px',
            animation: `confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
          }}
        />
      ))}
    </div>
  );
};

// ─── Phase Transition Flash ─────────────────────────────────────────
const PhaseFlash: React.FC<{ color?: string }> = ({ color = 'from-white/20' }) => (
  <div className={`fixed inset-0 z-[55] pointer-events-none bg-gradient-to-b ${color} to-transparent animate-phase-flash`} />
);

// ─── Paw Cursor Trail ───────────────────────────────────────────────
const PawCursorTrail = () => {
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTimeRef.current < 200) return; // throttle
      lastTimeRef.current = now;

      const paw = document.createElement('div');
      paw.className = 'paw-trail';
      paw.textContent = '🐾';
      paw.style.left = `${e.clientX}px`;
      paw.style.top = `${e.clientY}px`;
      paw.style.setProperty('--paw-rot', `${Math.random() * 40 - 20}deg`);
      document.body.appendChild(paw);
      setTimeout(() => paw.remove(), 800);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return null;
};

// ─── Mystical Particles (Role Reveal atmosphere) ────────────────────
const MysticalParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      mx: (Math.random() - 0.5) * 40,
      my: -(Math.random() * 30 + 10),
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
      size: 3 + Math.random() * 5,
      emoji: ['✨', '🌟', '⭐', '💫'][i % 4],
    })),
  []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[12] overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute text-xs"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            ['--mx' as string]: `${p.mx}px`,
            ['--my' as string]: `${p.my}px`,
            animation: `mystic-float ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
};

// ─── Floating Reactions Display ──────────────────────────────────────
const FloatingReaction: React.FC<{ emoji: string; x: number; y: number; id: number }> = ({ emoji, x, y, id }) => (
  <div
    key={id}
    className="fixed z-[60] pointer-events-none animate-reaction-float text-3xl"
    style={{ left: x, top: y, transform: 'translate(-50%, 0)' }}
  >
    {emoji === 'BARK' ? '🔊' : emoji}
  </div>
);

// ─── Reaction Picker Bar ────────────────────────────────────────────
const ReactionBar: React.FC<{ onReaction: (emoji: string) => void }> = ({ onReaction }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-end gap-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center text-lg hover:scale-110 transition-all shadow-lg"
        title="Reactions"
      >
        😄
      </button>
      {open && (
        <div className="flex gap-1.5 bg-slate-900/90 backdrop-blur-xl rounded-2xl px-3 py-2 border border-slate-700/50 shadow-xl animate-fade-in-up">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => { onReaction(emoji); audioService.playClick(); }}
              className="text-xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
          <div className="w-px bg-slate-700/50 mx-1" />
          <button
            onClick={() => { onReaction('BARK'); audioService.playBark(); }}
            className="text-sm px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-full font-bold hover:bg-amber-500/30 transition-all"
          >
            BARK!
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Lobby Lore Background ──────────────────────────────────────────
const LORE_LINES = [
  { text: 'In the Puppy Kingdom, every pup was happy...', emoji: '🏰', delay: 0 },
  { text: '...playing fetch under the golden sun.', emoji: '☀️', delay: 1.5 },
  { text: 'But one night, the moon turned red.', emoji: '🌙', delay: 4 },
  { text: 'Some pups began to howl differently...', emoji: '🐺', delay: 7 },
  { text: '...their eyes glowed in the dark.', emoji: '👀', delay: 9 },
  { text: 'WerePups walked among the good pups!', emoji: '😱', delay: 11.5 },
  { text: 'Now the pack must sniff out the truth.', emoji: '🐾', delay: 14 },
  { text: 'Can you tell friend from foe?', emoji: '🔍', delay: 16.5 },
  { text: 'Trust no tail wag. Question every bark.', emoji: '❓', delay: 19 },
  { text: 'The Puppy Kingdom depends on you!', emoji: '💛', delay: 22 },
];

const LobbyLoreBackground = () => {
  // Drifting lore text
  const loreCycle = useMemo(() => {
    const totalDur = 26;
    return LORE_LINES.map((line, i) => ({
      ...line,
      // Position: stagger across the screen
      left: 8 + ((i * 37 + 11) % 75),
      top: 10 + ((i * 29 + 5) % 65),
      fontSize: i === 0 || i === LORE_LINES.length - 1 ? 15 : 12,
      totalDur,
    }));
  }, []);

  // Cute floating SVG illustrations
  const illustrations = useMemo(() => [
    // sleeping puppy
    { x: 8, y: 72, size: 50, content: '💤', delay: 1 },
    // bone
    { x: 85, y: 18, size: 28, content: '🦴', delay: 3 },
    // paw prints walking
    { x: 15, y: 30, size: 22, content: '🐾', delay: 0 },
    { x: 22, y: 26, size: 20, content: '🐾', delay: 0.5 },
    { x: 29, y: 30, size: 18, content: '🐾', delay: 1 },
    // little house
    { x: 75, y: 68, size: 36, content: '🏠', delay: 2 },
    // moon
    { x: 88, y: 8, size: 40, content: '🌕', delay: 0 },
    // flower
    { x: 45, y: 78, size: 24, content: '🌸', delay: 4 },
    // tree
    { x: 60, y: 72, size: 32, content: '🌳', delay: 1.5 },
    // star
    { x: 35, y: 12, size: 18, content: '⭐', delay: 2.5 },
    { x: 55, y: 8, size: 14, content: '✨', delay: 3.5 },
    { x: 70, y: 15, size: 16, content: '⭐', delay: 1 },
  ], []);

  return (
    <div className="fixed inset-0 z-[8] pointer-events-none overflow-hidden">
      {/* Subtle radial glow in center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.03)_0%,transparent_70%)]" />

      {/* Floating SVG illustrations */}
      {illustrations.map((ill, i) => (
        <div
          key={`ill-${i}`}
          className="absolute animate-float"
          style={{
            left: `${ill.x}%`,
            top: `${ill.y}%`,
            fontSize: ill.size,
            opacity: 0.08,
            animationDelay: `${ill.delay}s`,
            animationDuration: `${4 + (i % 3)}s`,
          }}
        >
          {ill.content}
        </div>
      ))}

      {/* Animated lore text lines — appear, linger, fade */}
      {loreCycle.map((line, i) => (
        <div
          key={`lore-${i}`}
          className="absolute"
          style={{
            left: `${line.left}%`,
            top: `${line.top}%`,
            maxWidth: '260px',
            animation: `lore-text-cycle ${line.totalDur}s ${line.delay}s ease-in-out infinite`,
            opacity: 0,
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: line.fontSize + 4 }}>{line.emoji}</span>
            <p
              className="text-slate-400/30 font-serif italic leading-snug"
              style={{ fontSize: line.fontSize }}
            >
              {line.text}
            </p>
          </div>
        </div>
      ))}

      {/* Wandering paw trail (a line of paws walking across bottom) */}
      <div className="absolute bottom-[15%] left-0 w-full">
        <div className="flex items-center gap-6" style={{ animation: 'paw-walk 20s linear infinite' }}>
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={`pw-${i}`}
              className="text-amber-400/5 inline-block"
              style={{
                fontSize: 16 + (i % 3) * 4,
                transform: `rotate(${i % 2 === 0 ? -15 : 15}deg)`,
              }}
            >
              🐾
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Mute button ───────────────────────────────────────────────────────
const MuteButton = () => {
  const [muted, setMuted] = useState(audioService.muted);
  return (
    <button
      onClick={() => setMuted(audioService.toggleMute())}
      className="fixed top-4 right-4 z-50 p-2.5 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-full hover:bg-slate-700/60 transition-all group"
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted
        ? <VolumeX size={18} className="text-slate-500 group-hover:text-slate-300" />
        : <Volume2 size={18} className="text-amber-400/80 group-hover:text-amber-300" />}
    </button>
  );
};

// ─── Scoreboard ─────────────────────────────────────────────────────────
const Scoreboard: React.FC<{ players: GameState['players']; myPlayerId: string | null }> = ({ players, myPlayerId }) => {
  const ranked = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [players],
  );
  const hasAnyScore = ranked.some(p => p.score > 0);

  const medalColors = ['text-amber-400', 'text-slate-300', 'text-amber-600'];

  return (
    <div className="w-full bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-700/40 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-700/40 flex items-center gap-2">
        <Trophy size={14} className="text-amber-400" />
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Leaderboard</span>
      </div>
      <div className="p-2 space-y-1 max-h-52 overflow-y-auto">
        {ranked.map((p, idx) => {
          const isMe = p.id === myPlayerId;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                isMe ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-slate-800/30'
              }`}
            >
              {/* Rank */}
              <div className="w-6 text-center shrink-0">
                {hasAnyScore && idx < 3 && p.score > 0 ? (
                  <Medal size={16} className={medalColors[idx]} />
                ) : (
                  <span className="text-[10px] text-slate-600 font-mono">{idx + 1}</span>
                )}
              </div>
              {/* Avatar */}
              <img src={p.avatarUrl} alt={p.name} className="w-8 h-8 rounded-full border-2 border-slate-700 shrink-0" />
              {/* Name */}
              <span className={`flex-1 text-sm font-medium truncate ${isMe ? 'text-indigo-300' : 'text-slate-300'}`}>
                {p.name}
                {p.isBot && <span className="ml-1 text-[9px] text-slate-600">BOT</span>}
              </span>
              {/* Score */}
              <div className="flex items-center gap-1 shrink-0">
                <Star size={12} className="text-amber-400/70" />
                <span className={`text-sm font-bold tabular-nums ${p.score > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                  {p.score}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main App ──────────────────────────────────────────────────────────
const App = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.LOGIN,
    roomCode: '',
    players: [],
    secretWord: '',
    timeRemaining: 0,
    tokensUsed: 0,
    tokenHistory: [],
    guesses: [],
    myPlayerId: null,
  });

  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_SEEDS[0]);
  const [roleRevealed, setRoleRevealed] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [showRoomBrowser, setShowRoomBrowser] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<{id: number; emoji: string; x: number; y: number}[]>([]);
  const nextReactionId = useRef(0);
  const [showReplay, setShowReplay] = useState(false);

  const prevPhaseRef = useRef(gameState.phase);
  const prevTokenCountRef = useRef(0);
  const [showPhaseFlash, setShowPhaseFlash] = useState(false);
  const [phaseFlashColor, setPhaseFlashColor] = useState('from-white/20');

  // ── Subscribe ──
  useEffect(() => {
    const unsub = gameService.subscribe(setGameState);
    const unsubRooms = gameService.onRoomList(setRooms);
    const unsubReaction = gameService.onReaction((reaction: ReactionEvent) => {
      // Play sound for reactions
      if (reaction.emoji === 'BARK') {
        audioService.playBark();
      } else {
        audioService.playReactionPop();
      }
      // Show floating reaction at a random-ish position near center
      const x = window.innerWidth * 0.3 + Math.random() * window.innerWidth * 0.4;
      const y = window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.2;
      const id = nextReactionId.current++;
      setFloatingReactions(prev => [...prev.slice(-8), { id, emoji: reaction.emoji, x, y }]);
      setTimeout(() => setFloatingReactions(prev => prev.filter(r => r.id !== id)), 2000);
    });
    return () => { unsub(); unsubRooms(); unsubReaction(); };
  }, []);

  // ── Refresh room list on LOGIN ──
  useEffect(() => {
    if (gameState.phase === GamePhase.LOGIN) {
      gameService.listRooms();
      const iv = setInterval(() => gameService.listRooms(), 3000);
      return () => clearInterval(iv);
    }
  }, [gameState.phase]);

  // ── Sound effects + phase transition flash ──
  useEffect(() => {
    const prev = prevPhaseRef.current;
    const curr = gameState.phase;
    if (prev !== curr) {
      // Phase transition flash
      const flashColors: Record<string, string> = {
        [GamePhase.ROLE_REVEAL]: 'from-indigo-500/30',
        [GamePhase.WORD_SELECTION]: 'from-amber-500/20',
        [GamePhase.DAY_PHASE]: 'from-amber-300/25',
        [GamePhase.VOTING]: 'from-red-500/30',
        [GamePhase.WEREWOLF_GUESS]: 'from-purple-500/30',
        [GamePhase.GAME_OVER]: gameState.winner === 'VILLAGE' ? 'from-emerald-400/30' : 'from-red-500/30',
      };
      if (flashColors[curr]) {
        setPhaseFlashColor(flashColors[curr]);
        setShowPhaseFlash(true);
        setTimeout(() => setShowPhaseFlash(false), 900);
      }

      switch (curr) {
        case GamePhase.LOBBY: audioService.playPop(); break;
        case GamePhase.ROLE_REVEAL: audioService.playReveal(); break;
        case GamePhase.DAY_PHASE: audioService.playSuccess(); break;
        case GamePhase.VOTING: audioService.playWarning(); break;
        case GamePhase.WEREWOLF_GUESS: audioService.playHowl(); break;
        case GamePhase.GAME_OVER:
          if (gameState.winner === 'VILLAGE') audioService.playVictoryDance();
          else audioService.playDefeatSlouch();
          break;
      }
      prevPhaseRef.current = curr;
    }
  }, [gameState.phase, gameState.winner]);

  useEffect(() => {
    if (gameState.tokenHistory.length > prevTokenCountRef.current) audioService.playPop();
    prevTokenCountRef.current = gameState.tokenHistory.length;
  }, [gameState.tokenHistory.length]);

  useEffect(() => {
    if (gameState.phase === GamePhase.DAY_PHASE && gameState.timeRemaining <= 10 && gameState.timeRemaining > 0) {
      audioService.playTick();
    }
  }, [gameState.phase, gameState.timeRemaining]);

  useEffect(() => {
    if (gameState.phase === GamePhase.VOTING || gameState.phase === GamePhase.WEREWOLF_GUESS) setHasVoted(false);
    if (gameState.phase === GamePhase.ROLE_REVEAL) setRoleRevealed(false);
  }, [gameState.phase]);

  // ── Dynamic page title ──
  useEffect(() => {
    const titles: Record<string, string> = {
      [GamePhase.LOGIN]: '🐾 WerePups Online',
      [GamePhase.LOBBY]: '🏠 Pack Gathering | WerePups',
      [GamePhase.ROLE_REVEAL]: '🌙 Night Falls... | WerePups',
      [GamePhase.WORD_SELECTION]: '📝 Choosing Word... | WerePups',
      [GamePhase.DAY_PHASE]: '☀️ Day Phase | WerePups',
      [GamePhase.VOTING]: '🗳️ Vote Now! | WerePups',
      [GamePhase.WEREWOLF_GUESS]: '🐺 Werewolf Hunt | WerePups',
      [GamePhase.GAME_OVER]: gameState.winner === 'VILLAGE' ? '🎉 Village Wins! | WerePups' : '🐺 Wolves Win! | WerePups',
    };
    document.title = titles[gameState.phase] || '🐾 WerePups Online';
  }, [gameState.phase, gameState.winner]);

  // ── Handlers ──
  const handleJoin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      audioService.playClick();
      gameService.joinGame(username, undefined, getAvatarUrl(selectedAvatar));
    }
  }, [username, selectedAvatar]);

  const handleJoinRoom = useCallback((roomCode: string) => {
    if (username.trim()) {
      audioService.playClick();
      gameService.joinGame(username, roomCode, getAvatarUrl(selectedAvatar));
    }
  }, [username, selectedAvatar]);

  const handleVote = useCallback((targetId: string) => {
    if (!hasVoted && gameState.myPlayerId) {
      audioService.playVote();
      gameService.vote(targetId);
      setHasVoted(true);
    }
  }, [hasVoted, gameState.myPlayerId]);

  const handleSendReaction = useCallback((emoji: string) => {
    gameService.sendReaction(emoji);
  }, []);

  // ── Derived state ──
  const myPlayer = gameState.players.find(p => p.id === gameState.myPlayerId);

  const bgVariant = useMemo(() => {
    switch (gameState.phase) {
      case GamePhase.DAY_PHASE: return 'dusk' as const;
      case GamePhase.VOTING: return 'red' as const;
      case GamePhase.WEREWOLF_GUESS: return 'purple' as const;
      case GamePhase.GAME_OVER: return gameState.winner === 'VILLAGE' ? 'green' as const : 'red' as const;
      default: return 'night' as const;
    }
  }, [gameState.phase, gameState.winner]);

  const isNightPhase = gameState.phase === GamePhase.ROLE_REVEAL ||
    gameState.phase === GamePhase.WEREWOLF_GUESS ||
    gameState.phase === GamePhase.WORD_SELECTION;

  const isDayPhase = gameState.phase === GamePhase.DAY_PHASE;

  const isVillageWin = gameState.winner === 'VILLAGE';
  const iWon = myPlayer
    ? (isVillageWin && myPlayer.role !== Role.WEREWOLF) || (!isVillageWin && myPlayer.role === Role.WEREWOLF)
    : false;

  const getRoleEmoji = (role: string) => {
    switch (role) {
      case 'WEREWOLF': return '🐺';
      case 'SEER': return '🔮';
      default: return '🐶';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'WEREWOLF': return 'Were-Pup';
      case 'SEER': return 'Psychic Pup';
      case 'VILLAGER': return 'Good Pup';
      default: return role;
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RENDER — Single persistent background + phase content
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <>
      {/* Persistent village background — changes mood per phase */}
      <VillageScene variant={bgVariant} />
      <MuteButton />
      <PawCursorTrail />
      {showPhaseFlash && <PhaseFlash color={phaseFlashColor} />}
      {gameState.phase === GamePhase.GAME_OVER && <Confetti variant={iWon ? 'gold' : 'silver'} />}

      {/* Night/Day overlay transitions */}
      {isNightPhase && <div className="night-overlay" />}
      {isDayPhase && <div className="day-overlay" />}

      {/* Floating reactions */}
      {floatingReactions.map(r => (
        <FloatingReaction key={r.id} id={r.id} emoji={r.emoji} x={r.x} y={r.y} />
      ))}

      {/* Reaction bar — visible during active game phases */}
      {(gameState.phase === GamePhase.DAY_PHASE || gameState.phase === GamePhase.VOTING ||
        gameState.phase === GamePhase.WEREWOLF_GUESS || gameState.phase === GamePhase.LOBBY) && (
        <ReactionBar onReaction={handleSendReaction} />
      )}

      {/* Timer urgency vignette */}
      {gameState.phase === GamePhase.DAY_PHASE && gameState.timeRemaining <= 10 && gameState.timeRemaining > 0 && (
        <div className="urgency-vignette-critical" />
      )}
      {gameState.phase === GamePhase.DAY_PHASE && gameState.timeRemaining > 10 && gameState.timeRemaining <= 30 && (
        <div className="urgency-vignette" />
      )}

      {/* Voting tension vignette */}
      {(gameState.phase === GamePhase.VOTING || gameState.phase === GamePhase.WEREWOLF_GUESS) && (
        <div className="voting-vignette" />
      )}

      {/* Mystical particles during role reveal */}
      {(gameState.phase === GamePhase.ROLE_REVEAL || gameState.phase === GamePhase.WORD_SELECTION) && <MysticalParticles />}

      {/* ──────── LOGIN ──────── */}
      {gameState.phase === GamePhase.LOGIN && (() => {
        const lobbyRooms = rooms.filter(r => r.phase === 'LOBBY');
        return (
          <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="max-w-lg w-full">
              <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
                {/* Title */}
                <div className="text-center mb-6">
                  <div className="inline-block mb-3 animate-float">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full flex items-center justify-center border-2 border-amber-500/30">
                      <span className="text-4xl animate-emoji-bounce">🐾</span>
                    </div>
                  </div>
                  <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 font-bold tracking-tight">
                    {'WEREPUPS'.split('').map((ch, i) => (
                      <span key={i} className="wiggle-letter" style={{ animationDelay: `${i * 0.12}s` }}>{ch}</span>
                    ))}
                  </h1>
                  <p className="text-slate-400 mt-1.5 text-sm flex items-center justify-center gap-1.5">
                    <PawPrint size={14} className="text-amber-500/50" />
                    A Cozy Puppy Mystery
                    <PawPrint size={14} className="text-amber-500/50" />
                  </p>
                </div>

                <form onSubmit={handleJoin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                      <span className="text-base">🐶</span> What's your name, pup?
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none text-white placeholder-slate-500 transition-all"
                      placeholder={['FluffyPup42', 'Sir Barksalot', 'WoofMaster', 'SnugglePaws', 'Captain Bork'][Math.floor(Date.now() / 5000) % 5]}
                      autoFocus
                    />
                  </div>

                  {/* Avatar Picker — Pick your pup! */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Pick Your Pup</label>

                    {/* Selected avatar preview -- large with animated ears */}
                    <div className="flex justify-center mb-3">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-amber-400 shadow-lg shadow-amber-400/30 animate-ring-pulse bg-slate-800">
                          <div
                            className="w-full h-full"
                            dangerouslySetInnerHTML={{ __html: getPuppySvgMarkup(selectedAvatar) }}
                          />
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500/90 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                          {BREED_LABELS[selectedAvatar] || selectedAvatar}
                        </div>
                      </div>
                    </div>

                    {/* Breed grid */}
                    <div className="grid grid-cols-8 gap-2">
                      {AVATAR_SEEDS.map((seed) => (
                        <button
                          key={seed}
                          type="button"
                          onClick={() => { setSelectedAvatar(seed); audioService.playBreedSelect(getBreedEarType(seed), getBreedHasTongue(seed)); }}
                          title={BREED_LABELS[seed] || seed}
                          className={`w-full aspect-square rounded-full overflow-hidden border-[3px] transition-all hover:scale-110 ${
                            selectedAvatar === seed
                              ? 'border-amber-400 shadow-lg shadow-amber-400/30 scale-110'
                              : 'border-slate-600/50 hover:border-slate-500 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={getAvatarUrl(seed)} alt={BREED_LABELS[seed] || seed} className="w-full h-full" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!username.trim()}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold py-3.5 rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 text-lg flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">🐾</span> Start a New Pack
                  </button>
                </form>

                {/* Room Browser */}
                <div className="mt-5 pt-4">
                  <div className="paw-divider mb-4">🐾</div>
                  <button
                    onClick={() => { setShowRoomBrowser(!showRoomBrowser); gameService.listRooms(); }}
                    className="w-full flex items-center justify-between text-sm text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Users size={16} />
                      Join Existing Room
                      {lobbyRooms.length > 0 && (
                        <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">
                          {lobbyRooms.length}
                        </span>
                      )}
                    </span>
                    <span className={`transition-transform ${showRoomBrowser ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {showRoomBrowser && (
                    <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                      {lobbyRooms.length === 0 ? (
                        <div className="text-center py-6">
                          <span className="text-2xl block mb-1.5">🐾</span>
                          <p className="text-slate-500 text-xs">No packs gathering yet...</p>
                          <p className="text-slate-600 text-[10px] mt-0.5">Be the first to create a room!</p>
                        </div>
                      ) : (
                        lobbyRooms.map((room) => (
                          <div key={room.code} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/40 hover:border-slate-600/60 transition-all animate-slide-in-right">
                            <div>
                              <span className="text-amber-400 font-mono text-sm font-bold">{room.code}</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Users size={12} className="text-slate-500" />
                                <span className="text-slate-500 text-xs">{room.playerCount}/{room.maxPlayers}</span>
                                <span className="text-slate-600 text-xs ml-1">
                                  {room.playerNames.slice(0, 3).join(', ')}
                                  {room.playerNames.length > 3 && '...'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleJoinRoom(room.code)}
                              disabled={!username.trim()}
                              className="px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-all disabled:opacity-30"
                            >
                              JOIN
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ──────── LOBBY ──────── */}
      {gameState.phase === GamePhase.LOBBY && (() => {
        const allReady = gameState.players.length > 1 && gameState.players.every(p => p.isReady);
        const lobbyPlayers = gameState.players;
        const readyCount = lobbyPlayers.filter(p => p.isReady).length;
        const funFacts = [
          '🐶 Puppies dream about playing fetch!',
          '🐾 A wagging tail means a happy pup!',
          '🧠 Puppies can learn up to 250 words!',
          '🐕 A group of puppies is called a litter!',
          '💤 Puppies sleep 18-20 hours a day!',
          '🐺 Wolves can hear sounds up to 10 miles away!',
          '🌙 WerePups only reveal themselves at night...',
          '🔮 The Psychic Pup always knows the truth!',
        ];
        const factIndex = Math.floor((Date.now() / 8000)) % funFacts.length;

        return (
          <>
          <LobbyLoreBackground />
          <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative z-10">
            <div className="w-full max-w-2xl flex flex-col items-center gap-6">

              {/* ── Header Card: Room Info ── */}
              <div className="w-full bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/40 p-5 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center animate-breathe">
                      <span className="text-xl">🐾</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-serif text-slate-100 leading-tight">Pack Gathering</h2>
                      <button
                        onClick={() => { navigator.clipboard.writeText(gameState.roomCode); audioService.playClick(); }}
                        className="flex items-center gap-1.5 mt-0.5 group"
                        title="Click to copy room code"
                      >
                        <span className="text-amber-400/80 font-mono text-sm tracking-widest group-hover:text-amber-300 transition-colors">{gameState.roomCode}</span>
                        <span className="text-[9px] text-slate-600 group-hover:text-slate-400 transition-colors">(tap to copy)</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/50 text-sm text-slate-300 flex items-center gap-1.5">
                      <PawPrint size={13} className="text-amber-400/70" />
                      <span className="font-bold">{lobbyPlayers.length}</span>
                      <span className="text-slate-500">pup{lobbyPlayers.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <div className={`w-1.5 h-1.5 rounded-full ${readyCount === lobbyPlayers.length && lobbyPlayers.length > 1 ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                      <span className="text-slate-500">{readyCount}/{lobbyPlayers.length} ready</span>
                    </div>
                  </div>
                </div>

                {/* Fun fact ticker */}
                <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center gap-2">
                  <Sparkles size={12} className="text-amber-400/40 shrink-0" />
                  <p className="text-[11px] text-slate-500 italic truncate">{funFacts[factIndex]}</p>
                </div>
              </div>

              {/* ── Player Grid ── */}
              <div className="w-full">
                <div className={`grid gap-3 ${lobbyPlayers.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : lobbyPlayers.length <= 6 ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-4 sm:grid-cols-8'}`}>
                  {lobbyPlayers.map((player, index) => {
                    const isMe = player.id === gameState.myPlayerId;
                    return (
                      <div
                        key={player.id}
                        className={`animate-card-appear hover-tilt flex flex-col items-center p-3 rounded-2xl border transition-all duration-300
                          ${player.isReady
                            ? 'bg-green-500/5 border-green-500/25 shadow-[0_0_12px_rgba(34,197,94,0.08)]'
                            : isMe
                              ? 'bg-indigo-500/5 border-indigo-500/20'
                              : 'bg-slate-800/30 border-slate-700/30'
                          }
                          ${player.wantsMayor ? 'ring-2 ring-amber-400/20 ring-offset-1 ring-offset-transparent' : ''}
                        `}
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        {/* Avatar */}
                        <div className="relative mb-2">
                          <div className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden border-[3px] transition-all duration-300 shadow-lg hover-wiggle
                            ${player.wantsMayor
                              ? 'border-amber-400 shadow-amber-400/20'
                              : player.isReady
                                ? 'border-green-400 shadow-green-400/15'
                                : isMe
                                  ? 'border-indigo-400 shadow-indigo-400/15'
                                  : 'border-slate-600/50'
                            }
                          `}>
                            <img src={player.avatarUrl} alt={player.name} className="w-full h-full" />
                          </div>

                          {/* Wants Pack Leader crown */}
                          {player.wantsMayor && (
                            <div className="absolute -top-2 -right-1 bg-amber-400 text-slate-900 rounded-full p-1 shadow-lg z-20 animate-bounce-in">
                              <Crown size={11} fill="currentColor" />
                            </div>
                          )}

                          {/* Score badge */}
                          {player.score > 0 && (
                            <div className="absolute -top-1 -left-1 bg-amber-500 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-md z-20 border border-amber-300">
                              {player.score}
                            </div>
                          )}

                          {/* Bot badge */}
                          {player.isBot && (
                            <div className="absolute -bottom-0.5 right-0 bg-slate-800 border border-slate-600 rounded-full p-0.5 z-10">
                              <Bot size={10} className="text-slate-400" />
                            </div>
                          )}

                          {/* Ready check overlay */}
                          {player.isReady && (
                            <div className="absolute inset-0 flex items-end justify-center">
                              <div className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg -mb-0.5 animate-check-pop text-[11px] font-bold">
                                ✓
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <p className={`text-xs font-semibold text-center truncate max-w-full leading-tight ${isMe ? 'text-indigo-300' : 'text-slate-300'}`}>
                          {player.name}
                        </p>

                        {/* Status */}
                        <div className="flex items-center gap-1 mt-0.5">
                          {isMe && <span className="text-[9px] text-indigo-400/60 font-medium">you</span>}
                          {player.wantsMayor && !isMe && <span className="text-[9px] text-amber-400/70">👑</span>}
                          {!player.isReady && !isMe && (
                            <span className="text-[9px] text-slate-600">
                              <span className="inline-block animate-pulse">...</span>
                            </span>
                          )}
                        </div>
                        {/* Achievement badges */}
                        {player.achievements && player.achievements.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                            {player.achievements.slice(0, 3).map((a) => {
                              const cfg = ACHIEVEMENT_CONFIG[a];
                              return cfg ? (
                                <span key={a} className="text-[9px] animate-badge-glow rounded-full bg-slate-800/80 px-1 py-0.5 border border-amber-500/20" title={cfg.label}>
                                  {cfg.icon}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Empty slots (show up to 3 total min) */}
                  {lobbyPlayers.length < 3 && Array.from({ length: 3 - lobbyPlayers.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex flex-col items-center p-3 rounded-2xl border border-dashed border-slate-700/30 animate-card-appear" style={{ animationDelay: `${(lobbyPlayers.length + i) * 80}ms` }}>
                      <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full border-2 border-dashed border-slate-700/30 flex items-center justify-center mb-2">
                        <span className="text-slate-700 text-xl animate-pulse">?</span>
                      </div>
                      <p className="text-[10px] text-slate-700 font-medium">Waiting...</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Pack Leader Volunteers ── */}
              {gameState.players.some(p => p.wantsMayor) && (
                <div className="w-full px-5 py-3 bg-amber-500/8 border border-amber-500/20 rounded-2xl animate-fade-in-up">
                  <div className="flex items-center gap-2">
                    <Crown size={14} className="text-amber-400 shrink-0" />
                    <p className="text-amber-400 text-xs">
                      <span className="font-bold">
                        {gameState.players.filter(p => p.wantsMayor).map(p => p.name).join(', ')}
                      </span>
                      {gameState.players.filter(p => p.wantsMayor).length === 1 ? ' wants' : ' want'} to be Pack Leader
                      {gameState.players.filter(p => p.wantsMayor).length > 1 && <span className="text-amber-500/60 ml-1">(one picked randomly)</span>}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Scoreboard ── */}
              {gameState.players.some(p => p.score > 0) && (
                <div className="w-full animate-fade-in-up">
                  <Scoreboard players={gameState.players} myPlayerId={gameState.myPlayerId} />
                </div>
              )}

              {/* ── Difficulty Selector ── */}
              <div className="w-full bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-700/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-amber-400/60" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Difficulty</span>
                </div>
                <div className="flex gap-2">
                  {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((diff) => {
                    const cfg = DIFFICULTY_CONFIG[diff];
                    const isActive = gameState.difficulty === diff;
                    return (
                      <button
                        key={diff}
                        onClick={() => { gameService.setDifficulty(diff); audioService.playClick(); }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${cfg.color} text-white shadow-lg`
                            : 'bg-slate-800/50 text-slate-500 hover:text-slate-300 border border-slate-700/30'
                        }`}
                      >
                        <span>{cfg.emoji}</span> {cfg.label}
                      </button>
                    );
                  })}
                </div>
                {/* Werewolf count info */}
                <div className="mt-2 text-center">
                  <span className="text-[10px] text-slate-500">
                    🐺 {gameState.numWerewolves || 1} werewolf pup{(gameState.numWerewolves || 1) > 1 ? 's' : ''} will be among you
                  </span>
                </div>
              </div>

              {/* ── Action Buttons ── */}
              <div className="w-full flex flex-col gap-3">
                {/* Primary row: Ready + Start */}
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => { gameService.toggleReady(); audioService.playClick(); }}
                    className={`flex-1 py-3.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${
                      myPlayer?.isReady
                        ? 'bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-600/20'
                    }`}
                  >
                    {myPlayer?.isReady ? (
                      <><span className="text-green-400">✓</span> Ready!</>
                    ) : (
                      <><PawPrint size={16} /> Ready Up</>
                    )}
                  </button>

                  {myPlayer?.isReady && allReady && (
                    <button
                      onClick={() => gameService.startGame()}
                      className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 hover:from-amber-400 hover:to-orange-400 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 text-sm animate-pulse"
                    >
                      <Sparkles size={16} /> Start Game <ArrowRight size={16} />
                    </button>
                  )}
                </div>

                {/* Secondary row: Pack Leader + Add Bot */}
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => { gameService.toggleWantsMayor(); audioService.playClick(); }}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      myPlayer?.wantsMayor
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/35 shadow-md shadow-amber-500/10'
                        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 border border-slate-700/40'
                    }`}
                  >
                    <Crown size={15} /> {myPlayer?.wantsMayor ? 'Volunteered!' : 'Be Pack Leader'}
                  </button>
                  <button
                    onClick={() => { gameService.addBot(); audioService.playPop(); }}
                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 border border-slate-700/40 flex items-center justify-center gap-2 transition-all"
                  >
                    <Bot size={15} /> Add Bot
                  </button>
                </div>
              </div>

              {/* ── Waiting status ── */}
              {!allReady && lobbyPlayers.length >= 2 && (
                <div className="text-center animate-fade-in-up">
                  <p className="text-slate-500 text-xs flex items-center gap-2 justify-center">
                    <span className="text-base animate-emoji-bounce">🐕</span>
                    Sniffing around
                    <span className="sniff-dots"><span>.</span><span>.</span><span>.</span></span>
                    waiting for all pups
                  </p>
                </div>
              )}
              {lobbyPlayers.length < 2 && (
                <div className="text-center animate-fade-in-up">
                  <p className="text-slate-500 text-xs flex items-center justify-center gap-1.5">
                    <span className="text-base">🐶</span>
                    It's lonely here! Need at least 2 pups to start.
                  </p>
                  <p className="text-slate-600 text-[10px] mt-1">Share the room code with your friends!</p>
                </div>
              )}
            </div>
          </div>
          </>
        );
      })()}

      {/* ──────── ROLE REVEAL ──────── */}
      {gameState.phase === GamePhase.ROLE_REVEAL && myPlayer && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
          <div className="w-full flex flex-col items-center">
            <div className="mb-8 text-center animate-fade-in-up">
              <div className="relative inline-block mb-3">
                <Moon size={44} className="text-indigo-300 mx-auto opacity-70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-400/10 animate-ping-slow" />
                </div>
              </div>
              <h2 className="text-3xl font-serif text-slate-100 mb-2">Night Has Fallen</h2>
              <p className="text-slate-400 text-sm">Tap your card to discover your breed...</p>
              <p className="text-indigo-400/40 text-xs mt-1 italic">Shh... the pups are sleeping</p>
            </div>
            <RoleCard
              role={myPlayer.role}
              isMayor={myPlayer.isMayor}
              secretWord={gameState.secretWord}
              revealed={roleRevealed}
              onReveal={() => { setRoleRevealed(true); audioService.playReveal(); }}
            />
            {roleRevealed && (
              <div className="mt-10 text-center animate-fade-in-up">
                <p className="text-amber-400 animate-pulse mb-3 text-sm">Dawn is breaking...</p>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ animation: 'width 6s linear forwards', width: '0%' }}></div>
                </div>
              </div>
            )}
            <style>{`@keyframes width { from { width: 0%; } to { width: 100%; } }`}</style>
          </div>
        </div>
      )}

      {/* ──────── WORD SELECTION ──────── */}
      {gameState.phase === GamePhase.WORD_SELECTION && myPlayer && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-lg flex flex-col items-center">
            {myPlayer.isMayor ? (
              <>
                <div className="mb-8 text-center animate-fade-in-up">
                  <PawPrint size={36} className="text-amber-400 mx-auto mb-3" />
                  <h2 className="text-3xl font-serif text-slate-100 mb-2">Choose the Secret Word</h2>
                  <p className="text-slate-400 text-sm">As Pack Leader, pick a word for your pack to guess!</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="text-amber-400 font-mono text-lg font-bold">{gameState.timeRemaining}s</span>
                    <span className="text-slate-500 text-xs">remaining</span>
                  </div>
                </div>
                <div className="grid gap-3 w-full">
                  {(gameState.wordOptions || []).map((word, i) => (
                    <button
                      key={word}
                      onClick={() => { gameService.chooseWord(word); audioService.playWordChosen(); }}
                      className="w-full px-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-slate-800 to-slate-700 text-slate-100 border border-slate-600/50 hover:from-amber-500/20 hover:to-orange-500/20 hover:border-amber-500/50 hover:text-amber-300 transition-all duration-200 shadow-lg hover:shadow-amber-500/10 animate-fade-in-up flex items-center justify-between group"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span>{word}</span>
                      <span className="text-slate-500 group-hover:text-amber-400 transition-colors text-sm">Pick</span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-slate-500 text-xs text-center">A random word will be chosen if time runs out</p>
              </>
            ) : (
              <div className="text-center animate-fade-in-up">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                    <PawPrint size={32} className="text-amber-400 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-serif text-slate-100 mb-2">Pack Leader is Choosing...</h2>
                  <p className="text-slate-400 text-sm">The Pack Leader is picking the secret word for this round</p>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-amber-400 font-mono text-lg font-bold">{gameState.timeRemaining}s</span>
                </div>
                <div className="flex gap-1.5 justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────── DAY PHASE ──────── */}
      {gameState.phase === GamePhase.DAY_PHASE && (
        <div className="h-screen relative z-10">
          <GameBoard
            state={gameState}
            onTokenClick={(type, targetId) => gameService.submitToken(type, targetId)}
            onSubmitGuess={(text) => gameService.submitGuess(text)}
          />
        </div>
      )}

      {/* ──────── VOTING ──────── */}
      {gameState.phase === GamePhase.VOTING && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-3xl w-full flex flex-col items-center">
            <div className="mb-4 text-center animate-fade-in-up">
              <div className="text-4xl mb-3 animate-heartbeat">🐺</div>
              <h2 className="text-3xl sm:text-4xl font-serif text-red-400 font-bold animate-heartbeat">Time's Up!</h2>
              <p className="text-slate-300 mt-2">Which pup is secretly a Werewolf? Cast your vote!</p>
            </div>
            <PlayerCircle
              players={gameState.players}
              myPlayerId={gameState.myPlayerId}
              onPlayerClick={handleVote}
              canClick={(id) => !hasVoted && id !== myPlayer?.id}
              hoverLabel="VOTE"
              showVotes
              accentColor="red"
              centerContent={
                <div className="flex flex-col items-center opacity-60">
                  <span className="text-3xl">🐾</span>
                  <span className="text-red-400/60 text-[10px] uppercase tracking-widest mt-1">Sniff Out</span>
                </div>
              }
            />
            {hasVoted && (
              <div className="mt-4 text-slate-400 text-sm text-center flex items-center justify-center gap-2">
                <span className="animate-emoji-bounce">🐾</span>
                Sniffing
                <span className="sniff-dots"><span>.</span><span>.</span><span>.</span></span>
                waiting for the other pups
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────── WEREWOLF GUESS ──────── */}
      {gameState.phase === GamePhase.WEREWOLF_GUESS && (() => {
        const isWerewolf = myPlayer?.role === Role.WEREWOLF;
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = gameState.timeRemaining % 60;
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
            <div className="max-w-3xl w-full flex flex-col items-center">
              <div className="mb-4 text-center animate-fade-in-up">
                <Eye size={40} className="text-purple-400 mx-auto mb-3" />
                <h2 className="text-3xl sm:text-4xl font-serif text-purple-300 font-bold">The Psychic Pup Hunt</h2>
                <p className="text-slate-300 mt-2">
                  The word was <span className="font-bold text-amber-400">{gameState.secretWord}</span>
                </p>
                <div className={`mt-3 text-2xl font-mono ${gameState.timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-purple-300'}`}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
              </div>

              {isWerewolf ? (
                <>
                  <div className="mb-3 px-5 py-2.5 bg-red-900/20 border border-red-800/50 rounded-xl text-center animate-bounce-in">
                    <p className="text-red-400 text-sm font-bold flex items-center justify-center gap-2">
                      <Search size={16} /> You're the Werewolf Pup! Find the Psychic Pup to steal the win!
                    </p>
                  </div>
                  <PlayerCircle
                    players={gameState.players}
                    myPlayerId={gameState.myPlayerId}
                    onPlayerClick={handleVote}
                    canClick={(id) => !hasVoted && id !== myPlayer?.id}
                    hoverLabel="ACCUSE"
                    showVotes
                    accentColor="purple"
                    centerContent={
                      <div className="flex flex-col items-center opacity-60">
                        <Eye size={28} className="text-purple-400" />
                        <span className="text-purple-400/60 text-[10px] uppercase tracking-widest mt-1">Find Psychic</span>
                      </div>
                    }
                  />
                  {hasVoted && <div className="mt-4 text-slate-400 text-sm animate-pulse">Your guess has been submitted...</div>}
                </>
              ) : (
                <>
                  <PlayerCircle
                    players={gameState.players}
                    myPlayerId={gameState.myPlayerId}
                    accentColor="purple"
                    centerContent={
                      <div className="flex flex-col items-center">
                        <div className="text-3xl animate-float">🐺</div>
                        <span className="text-purple-400/60 text-[10px] uppercase tracking-widest mt-1">Hunting...</span>
                      </div>
                    }
                  />
                    <div className="mt-4 p-5 bg-slate-900/40 rounded-xl border border-slate-800/50 text-center max-w-sm">
                    <p className="text-purple-300 animate-pulse text-sm">The Werewolf Pup is sniffing for the Psychic Pup...</p>
                    <p className="text-slate-500 mt-1.5 text-xs">If they guess correctly, they steal the win!</p>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* ──────── GAME OVER ──────── */}
      {gameState.phase === GamePhase.GAME_OVER && (() => {
        const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
        const mvpPlayer = sortedPlayers[0];
        const mvpIsMeaningful = mvpPlayer && mvpPlayer.score > 0;

        // Build replay timeline
        const replayEvents: { time: number; type: 'guess' | 'token'; player: string; detail: string }[] = [];
        (gameState.guesses || []).forEach(g => {
          const p = gameState.players.find(pl => pl.id === g.playerId);
          replayEvents.push({ time: g.timestamp, type: 'guess', player: p?.name || '?', detail: `guessed "${g.text}"` });
        });
        (gameState.tokenHistory || []).forEach(t => {
          const target = gameState.players.find(pl => pl.id === t.targetPlayerId);
          replayEvents.push({ time: t.timestamp, type: 'token', player: target?.name || '?', detail: `received ${t.type} token` });
        });
        replayEvents.sort((a, b) => a.time - b.time);
        const firstTime = replayEvents[0]?.time || 0;

        return (
          <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="max-w-lg w-full">
              <div className={`bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border shadow-[0_0_60px_rgba(0,0,0,0.5)] text-center ${
                isVillageWin ? 'border-emerald-500/30' : 'border-red-500/30'
              }`}>
                {/* Big animated icon */}
                <div className="mb-4 animate-bounce-in">
                  {isVillageWin ? (
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 animate-winner-glow">
                      <Trophy size={48} className="text-amber-400 drop-shadow-lg" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30">
                      <span className="text-5xl">🐺</span>
                    </div>
                  )}
                </div>

                <h2 className={`text-3xl sm:text-4xl font-serif font-black mb-1 ${isVillageWin ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isVillageWin ? 'Good Pups Win!' : 'Werewolf Pups Win!'}
                </h2>
                {iWon
                  ? <p className="text-emerald-300 text-sm font-medium mb-3">You won this round! 🎉</p>
                  : <p className="text-slate-400 text-sm mb-3">Better luck next time, pup!</p>
                }

                {/* Secret word reveal */}
                <div className="mb-5 inline-block px-6 py-2.5 bg-slate-800/60 rounded-2xl border border-amber-500/20">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">The Secret Word</p>
                  <p className="text-2xl font-serif font-black text-amber-400 tracking-wide">{gameState.secretWord}</p>
                </div>

                {/* MVP callout */}
                {mvpIsMeaningful && (
                  <div className="mb-4 animate-role-reveal" style={{ animationDelay: '0.3s' }}>
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/25 rounded-2xl">
                      <img src={mvpPlayer.avatarUrl} alt={mvpPlayer.name} className="w-10 h-10 rounded-full border-2 border-amber-400 shadow-lg animate-victory-dance" />
                      <div className="text-left">
                        <p className="text-[10px] uppercase tracking-widest mvp-badge font-bold">MVP</p>
                        <p className="text-amber-300 text-sm font-bold">{mvpPlayer.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-amber-400" />
                        <span className="text-xl font-black text-amber-400">{mvpPlayer.score}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Player role reveals — with victory dance / defeat slouch */}
                <div className="space-y-2 mb-5">
                  {sortedPlayers.map((p, idx) => {
                    const wonThisRound = isVillageWin ? p.role !== 'WEREWOLF' : p.role === 'WEREWOLF';
                    const roleColor = p.role === 'WEREWOLF' ? 'border-red-500/40 bg-red-950/20' : p.role === 'SEER' ? 'border-blue-500/40 bg-blue-950/20' : 'border-emerald-500/30 bg-emerald-950/15';
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border animate-role-reveal transition-all ${roleColor} ${wonThisRound ? 'ring-1 ring-emerald-400/10' : ''}`}
                        style={{ animationDelay: `${0.5 + idx * 0.15}s` }}
                      >
                        {/* Rank */}
                        <div className="w-6 text-center shrink-0">
                          {idx === 0 && p.score > 0 ? <span className="text-base">🥇</span>
                            : idx === 1 && p.score > 0 ? <span className="text-base">🥈</span>
                            : idx === 2 && p.score > 0 ? <span className="text-base">🥉</span>
                            : <span className="text-[10px] text-slate-600 font-mono">{idx + 1}</span>}
                        </div>

                        {/* Avatar with victory dance / defeat slouch */}
                        <div className={`relative ${wonThisRound ? 'animate-victory-dance' : 'animate-defeat-slouch'}`} style={{ animationDelay: `${0.8 + idx * 0.15}s` }}>
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            className={`w-11 h-11 rounded-full border-[2.5px] shadow-lg ${
                              p.role === 'WEREWOLF' ? 'border-red-500' : p.role === 'SEER' ? 'border-blue-400' : 'border-emerald-400'
                            }`}
                          />
                          {p.isMayor && (
                            <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-0.5 z-10">
                              <Crown size={10} fill="currentColor" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-200 truncate">{p.name}</span>
                            {p.isBot && <span className="text-[9px] text-slate-500 bg-slate-800 px-1 py-0.5 rounded">BOT</span>}
                            {wonThisRound && <span className="text-[9px]">✨</span>}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm">{getRoleEmoji(p.role)}</span>
                            <span className={`text-[11px] font-bold ${p.role === 'WEREWOLF' ? 'text-red-400' : p.role === 'SEER' ? 'text-blue-400' : 'text-emerald-400'}`}>
                              {getRoleLabel(p.role)}
                            </span>
                            {(p.votesReceived || 0) > 0 && (
                              <span className="text-[9px] text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded-full">{p.votesReceived} vote{(p.votesReceived || 0) > 1 ? 's' : ''}</span>
                            )}
                          </div>
                          {/* Achievements */}
                          {p.achievements && p.achievements.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {p.achievements.map((a) => {
                                const cfg = ACHIEVEMENT_CONFIG[a];
                                return cfg ? (
                                  <span key={a} className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                                    {cfg.icon} {cfg.label}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-amber-400" />
                            <span className="text-lg font-black text-amber-400 tabular-nums animate-score-pop" style={{ animationDelay: `${0.8 + idx * 0.15}s` }}>{p.score}</span>
                          </div>
                          {wonThisRound && (
                            <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Winner</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Replay Timeline */}
                {replayEvents.length > 0 && (
                  <div className="mb-5">
                    <button
                      onClick={() => setShowReplay(!showReplay)}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 mx-auto mb-2"
                    >
                      <Clock size={12} />
                      {showReplay ? 'Hide' : 'Show'} Game Replay
                      <span className={`transition-transform ${showReplay ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {showReplay && (
                      <div className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-3 max-h-48 overflow-y-auto text-left space-y-1.5">
                        {replayEvents.map((evt, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 animate-timeline-slide"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <span className="text-[9px] text-slate-600 font-mono w-12 shrink-0 text-right">
                              {Math.round((evt.time - firstTime) / 1000)}s
                            </span>
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              evt.type === 'guess' ? 'bg-sky-400' : evt.detail.includes('CORRECT') ? 'bg-emerald-400' : 'bg-amber-400'
                            }`} />
                            <span className="text-[10px] text-slate-300">
                              <span className="font-semibold">{evt.player}</span>
                              {' '}{evt.detail}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => { gameService.resetGame(); setShowReplay(false); }}
                  className="inline-flex items-center gap-2 px-10 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 rounded-xl font-bold text-base hover:from-amber-400 hover:to-orange-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/25"
                >
                  <RefreshCw size={18} /> Play Again
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default App;
