import React, { useState } from 'react';
import { Role } from '../../types';
import { ROLE_DESCRIPTIONS } from '../../constants';
import { Crown } from '../../utils/icons';

interface RoleCardProps {
  role: Role;
  isMayor: boolean;
  secretWord: string;
  revealed: boolean;
  onReveal: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, isMayor, secretWord, revealed, onReveal }) => {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    if (!flipped) {
      setFlipped(true);
      onReveal();
    }
  };

  const getRoleEmoji = (r: Role) => {
    switch (r) {
      case Role.WEREWOLF: return '🐺';
      case Role.SEER: return '🔮';
      default: return '🐶';
    }
  };

  const getRoleLabel = (r: Role) => {
    switch (r) {
      case Role.WEREWOLF: return 'Were-Pup';
      case Role.SEER: return 'Psychic Pup';
      default: return 'Good Pup';
    }
  };

  const getRoleColor = (r: Role) => {
    switch (r) {
      case Role.WEREWOLF: return 'border-red-500/50 bg-gradient-to-br from-red-950/80 to-slate-900';
      case Role.SEER: return 'border-blue-500/50 bg-gradient-to-br from-blue-950/80 to-slate-900';
      default: return 'border-emerald-500/50 bg-gradient-to-br from-emerald-950/80 to-slate-900';
    }
  };

  const getRoleGlow = (r: Role) => {
    switch (r) {
      case Role.WEREWOLF: return 'shadow-[0_0_40px_rgba(239,68,68,0.15)]';
      case Role.SEER: return 'shadow-[0_0_40px_rgba(59,130,246,0.15)]';
      default: return 'shadow-[0_0_40px_rgba(34,197,94,0.15)]';
    }
  };

  const displayWord = role === Role.WEREWOLF || role === Role.SEER || isMayor;

  return (
    <div className="perspective-1000 w-full max-w-xs mx-auto h-[380px] cursor-pointer" onClick={handleClick}>
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>

        {/* Back of Card */}
        <div className="absolute w-full h-full backface-hidden rounded-2xl border-[3px] border-amber-600/30 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/20 flex items-center justify-center mb-4">
            <span className="text-5xl">🐾</span>
          </div>
          <h2 className="text-2xl font-serif text-amber-400 tracking-widest uppercase">Werepups</h2>
          <p className="mt-4 text-slate-500 text-xs">Tap to reveal your breed</p>
          <div className="mt-6 w-16 h-0.5 bg-amber-600/20 rounded" />
        </div>

        {/* Front of Card */}
        <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl border-[3px] ${getRoleColor(role)} ${getRoleGlow(role)} flex flex-col items-center justify-between p-7`}>
          {/* Mayor badge */}
          {isMayor && (
            <div className="absolute top-3 right-3">
              <div className="bg-amber-400 text-slate-900 rounded-full p-1.5 shadow-lg">
                <Crown size={18} fill="currentColor" />
              </div>
            </div>
          )}

          {/* Role icon & name */}
          <div className="mt-6 flex flex-col items-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
              <span className="text-4xl">{getRoleEmoji(role)}</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-100 tracking-wider">{getRoleLabel(role)}</h2>
            {isMayor && <span className="text-amber-400 text-xs font-semibold mt-1">+ Pack Leader</span>}
            <p className="text-slate-400 text-center text-xs mt-2 italic px-2 leading-relaxed">
              {ROLE_DESCRIPTIONS[role]}
            </p>
          </div>

          {/* Secret Word */}
          <div className="w-full bg-black/30 rounded-xl p-4 backdrop-blur-sm border border-white/5 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Secret Word</p>
            {displayWord ? (
              <p className="text-xl font-bold text-amber-400">{secretWord}</p>
            ) : (
              <p className="text-lg text-slate-600">? ? ?</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
