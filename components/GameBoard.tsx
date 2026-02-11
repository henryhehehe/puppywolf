import React, { useState, useRef, useMemo, useEffect } from 'react';
import { GameState, TokenType, GuessEntry, Role } from '../types';
import { Token } from './ui/Token';
import { Clock, Crown, Sun, Send, MessageCircle, Eye, Shield, Skull } from 'lucide-react';
import { TOKEN_CONFIG } from '../constants';
import { audioService } from '../services/audioService';

interface GameBoardProps {
  state: GameState;
  onTokenClick: (type: TokenType, targetPlayerId?: string) => void;
  onSubmitGuess: (text: string) => void;
}

/* ─── Speech Bubble Component ─── */
const SpeechBubble: React.FC<{ text: string; isNew: boolean }> = ({ text, isNew }) => (
  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-30 pointer-events-none
    ${isNew ? 'animate-bubble-pop' : ''}`}
  >
    <div className="relative bg-white/95 text-slate-800 rounded-xl px-2.5 py-1 text-[10px] sm:text-xs font-medium
      shadow-lg shadow-black/20 border border-white/50 whitespace-nowrap max-w-[140px] truncate">
      {text}
      {/* Speech bubble tail */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
        border-l-[5px] border-l-transparent
        border-r-[5px] border-r-transparent
        border-t-[5px] border-t-white/95" />
    </div>
  </div>
);

/* ─── Role instruction config ─── */
const getRoleInstruction = (role: string | undefined, isMayor: boolean) => {
  if (isMayor) {
    return {
      icon: <Crown size={14} className="text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-950/30 text-amber-300',
      text: "You're the Pack Leader! You know the word. Use YES/NO tokens to guide your pack. Don't make it too obvious!",
    };
  }
  switch (role) {
    case 'WEREWOLF':
      return {
        icon: <Skull size={14} className="text-red-400" />,
        color: 'border-red-500/30 bg-red-950/30 text-red-300',
        text: "You're a Werewolf Pup! You know the word — try to mislead the pack without getting caught. Fellow wolves are marked with 🐺.",
      };
    case 'SEER':
      return {
        icon: <Eye size={14} className="text-blue-400" />,
        color: 'border-blue-500/30 bg-blue-950/30 text-blue-300',
        text: "You're the Psychic Pup! You know the word — guide your pack with subtle guesses. Don't reveal yourself to the wolves!",
      };
    default:
      return {
        icon: <Shield size={14} className="text-emerald-400" />,
        color: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300',
        text: "You're a Good Pup! Ask yes/no questions to figure out the secret word. Watch out — a Werewolf is hiding among you!",
      };
  }
};

export const GameBoard: React.FC<GameBoardProps> = ({ state, onTokenClick, onSubmitGuess }) => {
  const myPlayer = state.players.find(p => p.id === state.myPlayerId);
  const isMayor = myPlayer?.isMayor;
  const myRole = myPlayer?.role;
  const isWerewolf = myRole === Role.WEREWOLF;
  const mayorPlayer = state.players.find(p => p.isMayor);
  const nonMayorPlayers = state.players.filter(p => !p.isMayor);
  const roleInstruction = getRoleInstruction(myRole as string, !!isMayor);

  const [selectedToken, setSelectedToken] = useState<TokenType | null>(null);
  const [guessText, setGuessText] = useState('');
  const [guessSent, setGuessSent] = useState(false);
  const [flashTokenIds, setFlashTokenIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Track "new" guesses for pop animation + sound
  const prevGuessIdsRef = useRef<Set<string>>(new Set());
  const newGuessIds = useMemo(() => {
    const currentIds = new Set<string>((state.guesses || []).map(g => g.playerId));
    const newIds = new Set<string>();
    currentIds.forEach((id: string) => {
      if (!prevGuessIdsRef.current.has(id)) {
        newIds.add(id);
      }
    });
    return newIds;
  }, [state.guesses]);

  useEffect(() => {
    // Play sound for new guesses from OTHER players
    if (newGuessIds.size > 0) {
      const hasOtherGuess = Array.from(newGuessIds).some(id => id !== state.myPlayerId);
      if (hasOtherGuess) audioService.playNewGuess();
    }
    prevGuessIdsRef.current = new Set((state.guesses || []).map(g => g.playerId));
  }, [state.guesses]);

  // Track new tokens for flash animation + sound
  const prevTokenCountRef = useRef(state.tokenHistory.length);
  useEffect(() => {
    if (state.tokenHistory.length > prevTokenCountRef.current) {
      // New token(s) arrived
      const newTokens = state.tokenHistory.slice(0, state.tokenHistory.length - prevTokenCountRef.current);
      audioService.playTokenReceived();
      const ids = new Set(newTokens.map(t => t.id));
      setFlashTokenIds(ids);
      setTimeout(() => setFlashTokenIds(new Set()), 600);
    }
    prevTokenCountRef.current = state.tokenHistory.length;
  }, [state.tokenHistory]);

  // Build a map of playerId -> latest guess
  const guessMap = useMemo(() => {
    const map = new Map<string, GuessEntry>();
    (state.guesses || []).forEach(g => {
      const existing = map.get(g.playerId);
      if (!existing || g.timestamp > existing.timestamp) {
        map.set(g.playerId, g);
      }
    });
    return map;
  }, [state.guesses]);

  // Mayor: select a token, then tap a player to assign it
  const handleSelectToken = (type: TokenType) => {
    if (selectedToken === type) {
      setSelectedToken(null); // deselect
    } else {
      setSelectedToken(type);
      audioService.playClick();
    }
  };

  const handleAssignToken = (targetPlayerId: string) => {
    if (!isMayor || !selectedToken) return;
    onTokenClick(selectedToken, targetPlayerId);
    audioService.playTokenGiven();
    setSelectedToken(null);
  };

  const handleSubmitGuess = () => {
    const trimmed = guessText.trim();
    if (!trimmed) return;
    onSubmitGuess(trimmed);
    audioService.playGuess();
    setGuessText('');
    setGuessSent(true);
    setTimeout(() => setGuessSent(false), 300);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitGuess();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = state.timeRemaining < 30;
  const isCriticalTime = state.timeRemaining < 10;

  // Circle positioning
  const radiusPct = nonMayorPlayers.length <= 3 ? 30 : nonMayorPlayers.length <= 5 ? 34 : 38;

  return (
    <div className={`flex flex-col h-full max-w-2xl mx-auto px-3 pt-3 pb-2 overflow-hidden ${isCriticalTime ? 'animate-[screen-shake_0.3s_ease-in-out_infinite]' : ''}`}>

      {/* ─── Top Bar: Timer + Secret Word (compact) ─── */}
      <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/40 shrink-0">
        {/* Timer */}
        <div className="flex items-center gap-2">
          <Clock size={15} className={isCriticalTime ? 'text-red-400 animate-pulse' : isLowTime ? 'text-orange-400' : 'text-slate-400'} />
          <span className={`text-base font-mono font-bold ${isCriticalTime ? 'text-red-400 animate-pulse' : isLowTime ? 'text-orange-400' : 'text-slate-100'}`}>
            {formatTime(state.timeRemaining)}
          </span>
        </div>

        {/* Secret Word */}
        <div className="text-center flex-1 mx-3">
          {(isMayor || myPlayer?.role === 'WEREWOLF' || myPlayer?.role === 'SEER') ? (
            <p className="text-base sm:text-lg font-serif font-bold text-amber-400 truncate">{state.secretWord}</p>
          ) : (
            <p className="text-base sm:text-lg font-serif font-bold text-slate-600">? ? ? ? ?</p>
          )}
        </div>

        {/* Day indicator */}
        <div className="flex items-center gap-1.5">
          <Sun size={14} className="text-amber-400/60" />
          <span className="text-[10px] text-slate-500 hidden sm:block">Day</span>
        </div>
      </div>

      {/* ─── Role Instructions (compact single line) ─── */}
      <div className={`mt-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center gap-1.5 shrink-0 ${roleInstruction.color}`}>
        {roleInstruction.icon}
        <p className="leading-snug truncate">{roleInstruction.text}</p>
      </div>

      {/* ─── Circle: Mayor center + Players around ─── */}
      <div className="flex-1 flex items-center justify-center min-h-0 py-3">
        <div className="relative" style={{ width: 'min(100%, 380px)', aspectRatio: '1 / 1' }}>
          {/* Dashed ring */}
          <div className="absolute inset-[14%] rounded-full border border-dashed border-slate-700/25 pointer-events-none" />

          {/* Mayor in the center */}
          {mayorPlayer && (() => {
            const mayorIsAllyWolf = isWerewolf && mayorPlayer.id !== state.myPlayerId && mayorPlayer.role === Role.WEREWOLF;
            return (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="flex flex-col items-center">
                  <div className="relative rounded-full">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] overflow-hidden bg-slate-800 hover-wiggle cursor-pointer
                      ${mayorIsAllyWolf ? 'border-red-500 shadow-red-500/30 shadow-lg' : 'border-amber-400'}`}
                      onMouseEnter={() => audioService.playHoverSqueak()}
                    >
                      <img src={mayorPlayer.avatarUrl} alt={mayorPlayer.name} className="w-full h-full" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 bg-amber-400 text-slate-900 rounded-full p-0.5 shadow-lg z-20">
                      <Crown size={12} fill="currentColor" />
                    </div>
                    {mayorIsAllyWolf && (
                      <div className="absolute -top-0.5 -left-0.5 z-20 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] shadow-lg border border-red-400">
                        🐺
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold mt-0.5 ${mayorIsAllyWolf ? 'text-red-400' : 'text-amber-300'}`}>{mayorPlayer.name}</span>
                  <span className="text-amber-500/40 text-[8px] uppercase tracking-widest">Pack Leader</span>
                </div>
              </div>
            );
          })()}

          {/* Non-mayor players around the circle */}
          {nonMayorPlayers.map((player, index) => {
            const angle = (2 * Math.PI * index) / nonMayorPlayers.length - Math.PI / 2;
            const leftPct = 50 + Math.cos(angle) * radiusPct;
            const topPct = 50 + Math.sin(angle) * radiusPct;
            const isMe = player.id === state.myPlayerId;
            const isAllyWolf = isWerewolf && !isMe && player.role === Role.WEREWOLF;
            const lastToken = state.tokenHistory.find(t => t.targetPlayerId === player.id);
            const guess = guessMap.get(player.id);
            const isNewGuess = newGuessIds.has(player.id);
            const isTargetable = isMayor && selectedToken !== null && !isMe;

            return (
              <div
                key={player.id}
                className={`absolute animate-fade-in-up ${isTargetable ? 'cursor-pointer' : ''}`}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${index * 60}ms`,
                }}
                onClick={() => isTargetable && handleAssignToken(player.id)}
              >
                <div className="flex flex-col items-center relative">
                  {/* Speech bubble for guess */}
                  {guess && <SpeechBubble text={guess.text} isNew={isNewGuess} />}

                  {/* Pulsing target ring when Mayor has a token selected */}
                  {isTargetable && (
                    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                      <div className="w-[58px] h-[58px] sm:w-[68px] sm:h-[68px] rounded-full border-2 border-amber-400/60 animate-ping-slow" />
                    </div>
                  )}

                  <div
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-[2.5px] shadow-lg transition-all hover-wiggle cursor-pointer
                    ${isTargetable ? 'border-amber-400 shadow-amber-400/30 scale-110' : isAllyWolf ? 'border-red-500 shadow-red-500/30' : isMe ? 'border-indigo-400 shadow-indigo-400/20' : guess ? 'border-sky-400 shadow-sky-400/20' : 'border-slate-600/60'}
                  `}
                    onMouseEnter={() => { if (!isTargetable) audioService.playHoverSqueak(); }}
                  >
                    <img src={player.avatarUrl} alt={player.name} className="w-full h-full" />
                    {isTargetable && (
                      <div className="absolute inset-0 bg-amber-400/10 flex items-center justify-center">
                        <span className="text-amber-300 text-[9px] font-bold uppercase drop-shadow-lg">Tap</span>
                      </div>
                    )}
                  </div>

                  {/* Werewolf ally indicator */}
                  {isAllyWolf && (
                    <div className="absolute -top-0.5 -left-0.5 z-20 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] shadow-lg border border-red-400">
                      🐺
                    </div>
                  )}

                  {/* Last received token */}
                  {lastToken && (
                    <div className={`absolute -bottom-1 -right-1 z-20 ${flashTokenIds.has(lastToken.id) ? 'animate-token-flash' : ''}`} style={{ transform: 'scale(0.5)' }}>
                      <Token type={lastToken.type} size="sm" disabled />
                    </div>
                  )}

                  <span className={`text-[9px] font-medium mt-0.5 text-center max-w-[56px] truncate
                    ${isTargetable ? 'text-amber-300 font-semibold' : isAllyWolf ? 'text-red-400 font-semibold' : isMe ? 'text-indigo-300 font-semibold' : 'text-slate-400'}
                  `}>
                    {player.name}
                  </span>
                  {isMe && <span className="text-[7px] text-indigo-400/50">You</span>}
                  {isAllyWolf && <span className="text-[7px] text-red-400/60">Ally</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Token History (horizontal scroll) ─── */}
      {state.tokenHistory.length > 0 && (
        <div className="shrink-0 mb-1.5">
          <div className="bg-slate-900/40 backdrop-blur-md rounded-lg border border-slate-700/30 px-2 py-1.5 overflow-x-auto">
            <div className="flex gap-2 items-center">
              {state.tokenHistory.slice(0, 12).map((token) => {
                const config = TOKEN_CONFIG[token.type];
                const targetPlayer = state.players.find(p => p.id === token.targetPlayerId);
                return (
                  <div key={token.id} className={`flex items-center gap-1 shrink-0 ${flashTokenIds.has(token.id) ? 'animate-token-flash' : 'animate-fade-in-up'}`}>
                    <Token type={token.type} size="sm" disabled />
                    <div className="flex flex-col leading-none">
                      <span className={`text-[9px] font-bold ${config.color}`}>{config.label}</span>
                      {targetPlayer && (
                        <span className="text-[8px] text-slate-500">{targetPlayer.name}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Mayor Controls / Guess Input ─── */}
      <div className="shrink-0">
        {isMayor ? (
          <div className="px-3 py-2.5 bg-slate-900/50 backdrop-blur-md rounded-xl border border-amber-500/30 shadow-lg">
            {/* Selected token indicator */}
            {selectedToken ? (
              <div className="mb-2 flex items-center justify-center gap-2 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <Token type={selectedToken} size="sm" disabled />
                <span className="text-amber-300 text-[11px] font-bold">
                  {TOKEN_CONFIG[selectedToken].label} — tap a pup above!
                </span>
                <button
                  onClick={() => setSelectedToken(null)}
                  className="ml-auto text-slate-400 hover:text-slate-200 text-[10px] px-1 py-0.5 rounded bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <p className="text-center text-slate-500 text-[10px] mb-2">Pick a token, then tap a player</p>
            )}

            <div className="flex justify-center items-center gap-2 sm:gap-3">
              {([TokenType.YES, TokenType.NO, TokenType.MAYBE, TokenType.SO_CLOSE, TokenType.WAY_OFF, TokenType.CORRECT] as const).map((tt) => {
                const isSelected = selectedToken === tt;
                const isCorrect = tt === TokenType.CORRECT;
                const label = tt === TokenType.YES ? 'YES' : tt === TokenType.NO ? 'NO' : tt === TokenType.MAYBE ? 'MAYBE' : tt === TokenType.SO_CLOSE ? 'CLOSE' : tt === TokenType.WAY_OFF ? 'FAR' : 'FOUND!';
                return (
                  <div key={tt} className="flex flex-col items-center gap-0.5">
                    <div className={`rounded-full transition-all ${isSelected ? (isCorrect ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-900 scale-110' : 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 scale-110') : ''}`}>
                      <Token type={tt} onClick={() => handleSelectToken(tt)} />
                    </div>
                    <span className={`text-[8px] ${isSelected ? (isCorrect ? 'text-emerald-300 font-bold' : 'text-amber-400 font-bold') : isCorrect ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={`px-3 py-2 bg-slate-900/50 backdrop-blur-md rounded-xl border shadow-lg transition-all
            ${guessSent ? 'border-sky-400/50 animate-guess-whoosh' : 'border-slate-700/40'}`}>
            <div className="flex gap-2 items-center">
              <MessageCircle size={14} className={`shrink-0 transition-colors ${guessSent ? 'text-sky-300' : 'text-sky-400'}`} />
              <input
                ref={inputRef}
                type="text"
                value={guessText}
                onChange={(e) => setGuessText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's your guess, pup?"
                maxLength={80}
                className="flex-1 bg-slate-800/80 border border-slate-600/50 rounded-lg px-2.5 py-2 text-sm text-slate-100
                  placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20
                  transition-all min-w-0"
              />
              <button
                onClick={handleSubmitGuess}
                disabled={!guessText.trim()}
                className="bg-sky-500/80 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500
                  text-white rounded-lg px-2.5 py-2 transition-all active:scale-95 disabled:active:scale-100 shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
