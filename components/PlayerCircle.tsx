import React from 'react';
import { Player, TokenAction } from '../types';
import { Crown, Bot } from 'lucide-react';
import { Token } from './ui/Token';

interface PlayerCircleProps {
  players: Player[];
  myPlayerId: string | null;
  centerPlayerId?: string;
  centerContent?: React.ReactNode;
  onPlayerClick?: (playerId: string) => void;
  canClick?: (playerId: string) => boolean;
  hoverLabel?: string;
  showVotes?: boolean;
  accentColor?: 'amber' | 'red' | 'purple';
  tokenHistory?: TokenAction[];
}

const accentStyles = {
  amber:  { hover: 'group-hover:border-amber-400 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]',  badge: 'bg-amber-500',  text: 'text-amber-400' },
  red:    { hover: 'group-hover:border-red-400 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',     badge: 'bg-red-500',    text: 'text-red-400' },
  purple: { hover: 'group-hover:border-purple-400 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]', badge: 'bg-purple-500', text: 'text-purple-400' },
};

export const PlayerCircle: React.FC<PlayerCircleProps> = ({
  players,
  myPlayerId,
  centerPlayerId,
  centerContent,
  onPlayerClick,
  canClick,
  hoverLabel = 'SELECT',
  showVotes = false,
  accentColor = 'amber',
  tokenHistory = [],
}) => {
  const centerPlayer = centerPlayerId ? players.find(p => p.id === centerPlayerId) : null;
  const circlePlayers = centerPlayerId ? players.filter(p => p.id !== centerPlayerId) : players;
  const accent = accentStyles[accentColor] || accentStyles.amber;

  // Adaptive radius: more players = wider circle
  const radiusPct = circlePlayers.length <= 3 ? 30 : circlePlayers.length <= 5 ? 34 : 38;

  return (
    <div className="relative w-full max-w-[460px] aspect-square mx-auto">
      {/* Decorative dashed ring */}
      <div className="absolute inset-[14%] rounded-full border border-dashed border-slate-700/40 pointer-events-none" />

      {/* Center content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        {centerPlayer ? (
          <div className="flex flex-col items-center animate-fade-in-up">
            <div className="relative animate-glow rounded-full">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-amber-400 overflow-hidden bg-slate-800">
                <img src={centerPlayer.avatarUrl} alt={centerPlayer.name} className="w-full h-full" />
              </div>
              <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-1 shadow-lg z-20">
                <Crown size={14} fill="currentColor" />
              </div>
            </div>
            <span className="text-amber-300 text-xs font-bold mt-1.5">{centerPlayer.name}</span>
            <span className="text-amber-500/50 text-[10px] uppercase tracking-widest font-semibold">Pack Leader</span>
          </div>
        ) : centerContent}
      </div>

      {/* Players around the circle */}
      {circlePlayers.map((player, index) => {
        const angle = (2 * Math.PI * index) / circlePlayers.length - Math.PI / 2;
        const leftPct = 50 + Math.cos(angle) * radiusPct;
        const topPct = 50 + Math.sin(angle) * radiusPct;
        const isMe = player.id === myPlayerId;
        const clickable = onPlayerClick != null && (canClick ? canClick(player.id) : true);
        const lastToken = tokenHistory.find(t => t.targetPlayerId === player.id);

        return (
          <div
            key={player.id}
            className="absolute group"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${index * 80}ms`,
            }}
          >
            <button
              onClick={() => clickable && onPlayerClick?.(player.id)}
              disabled={!clickable}
              className={`flex flex-col items-center transition-all duration-200 animate-fade-in-up ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Avatar */}
              <div className={`relative w-14 h-14 sm:w-[68px] sm:h-[68px] rounded-full overflow-hidden border-[3px] transition-all duration-200 shadow-lg
                ${isMe ? 'border-indigo-400 shadow-indigo-400/20' : 'border-slate-600/70'}
                ${clickable ? `${accent.hover} group-hover:scale-110` : ''}
              `}>
                <img src={player.avatarUrl} alt={player.name} className="w-full h-full" />

                {/* Bot badge */}
                {player.isBot && (
                  <div className="absolute bottom-0 right-0 bg-slate-800 border border-slate-600 rounded-full p-0.5 z-20">
                    <Bot size={8} className="text-slate-400" />
                  </div>
                )}

                {/* Hover overlay */}
                {clickable && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">{hoverLabel}</span>
                  </div>
                )}
              </div>

              {/* Vote badge */}
              {showVotes && (player.votesReceived || 0) > 0 && (
                <div className={`absolute -top-0.5 -right-0.5 ${accent.badge} text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce z-20`}>
                  {player.votesReceived}
                </div>
              )}

              {/* Mayor crown (when Mayor is in the circle, not center) */}
              {player.isMayor && !centerPlayerId && (
                <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-0.5 z-20">
                  <Crown size={10} fill="currentColor" />
                </div>
              )}

              {/* Last token indicator */}
              {lastToken && (
                <div className="absolute -bottom-1.5 -right-1.5 z-20" style={{ transform: 'scale(0.55)' }}>
                  <Token type={lastToken.type} size="sm" disabled />
                </div>
              )}

              {/* Name */}
              <span className={`text-[11px] font-medium mt-1 text-center max-w-[72px] truncate leading-tight
                ${isMe ? 'text-indigo-300 font-semibold' : 'text-slate-400'}
              `}>
                {player.name}
              </span>
              {isMe && <span className="text-[9px] text-indigo-400/60">You</span>}
            </button>
          </div>
        );
      })}
    </div>
  );
};
