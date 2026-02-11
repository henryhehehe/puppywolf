import { TokenType } from './types';

export const TOKEN_CONFIG: Record<TokenType, { label: string; color: string; bgColor: string; icon: string }> = {
  [TokenType.YES]: { label: 'Yes', color: 'text-green-500', bgColor: 'bg-green-900/30', icon: 'CheckCircle' },
  [TokenType.NO]: { label: 'No', color: 'text-red-500', bgColor: 'bg-red-900/30', icon: 'XCircle' },
  [TokenType.MAYBE]: { label: 'Maybe', color: 'text-orange-400', bgColor: 'bg-orange-900/30', icon: 'HelpCircle' },
  [TokenType.SO_CLOSE]: { label: 'So Close', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30', icon: 'AlertCircle' },
  [TokenType.WAY_OFF]: { label: 'Way Off', color: 'text-gray-400', bgColor: 'bg-gray-800', icon: 'ThumbsDown' },
  [TokenType.CORRECT]: { label: 'Correct!', color: 'text-emerald-400', bgColor: 'bg-emerald-900', icon: 'Star' },
};

export const ROLE_DESCRIPTIONS = {
  VILLAGER: "You're a Good Pup! Sniff out the Magic Word, or find the Werewolf Pup!",
  WEREWOLF: "You're a sneaky Werewolf Pup! You know the word — mislead the pack without getting caught!",
  SEER: "You're the Psychic Pup! You know the word — guide your pack with subtle hints!",
};

export const INITIAL_TIME = 240; // 4 minutes
