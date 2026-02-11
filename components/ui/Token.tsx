import React from 'react';
import { TokenType } from '../../types';
import { TOKEN_CONFIG } from '../../constants';
import { CheckCircle, XCircle, HelpCircle, AlertCircle, ThumbsDown, Star } from '../../utils/icons';

const ICON_MAP: Record<string, React.FC<{ size?: number; strokeWidth?: number }>> = {
  CheckCircle, XCircle, HelpCircle, AlertCircle, ThumbsDown, Star,
};

interface TokenProps {
  type: TokenType;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Token: React.FC<TokenProps> = ({ type, onClick, disabled, size = 'md' }) => {
  const config = TOKEN_CONFIG[type];
  const Icon = ICON_MAP[config.icon] || HelpCircle;

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} 
        ${config.bgColor} 
        ${config.color}
        rounded-full flex items-center justify-center 
        border-2 border-current shadow-[0_0_15px_rgba(0,0,0,0.3)]
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-110 active:scale-95 hover:shadow-[0_0_20px_currentColor]'}
      `}
      title={config.label}
    >
      <Icon size={iconSizes[size]} strokeWidth={3} />
    </button>
  );
};
