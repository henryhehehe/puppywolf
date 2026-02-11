export enum GamePhase {
  LOGIN = 'LOGIN',
  LOBBY = 'LOBBY',
  ROLE_REVEAL = 'ROLE_REVEAL',
  WORD_SELECTION = 'WORD_SELECTION',
  DAY_PHASE = 'DAY_PHASE',
  VOTING = 'VOTING',
  WEREWOLF_GUESS = 'WEREWOLF_GUESS',
  GAME_OVER = 'GAME_OVER',
}

export enum Role {
  VILLAGER = 'VILLAGER',
  WEREWOLF = 'WEREWOLF',
  SEER = 'SEER',
  MAYOR = 'MAYOR', 
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  isMayor: boolean;
  isReady: boolean;
  wantsMayor: boolean;
  avatarUrl?: string;
  votesReceived?: number;
  isBot?: boolean;
  score: number;
}

export enum TokenType {
  YES = 'YES',
  NO = 'NO',
  MAYBE = 'MAYBE',
  SO_CLOSE = 'SO_CLOSE',
  WAY_OFF = 'WAY_OFF',
  CORRECT = 'CORRECT',
}

export interface TokenAction {
  id: string;
  type: TokenType;
  timestamp: number;
  targetPlayerId?: string; 
}

export interface GuessEntry {
  playerId: string;
  text: string;
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  roomCode: string;
  players: Player[];
  secretWord: string;
  wordOptions?: string[];
  timeRemaining: number;
  tokensUsed: number;
  tokenHistory: TokenAction[];
  guesses: GuessEntry[];
  winner?: 'VILLAGE' | 'WEREWOLF';
  myPlayerId: string | null;
}

export interface RoomInfo {
  code: string;
  playerCount: number;
  maxPlayers: number;
  phase: string;
  playerNames: string[];
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

// --- BACKEND INTEGRATION TYPES ---

export interface GameService {
  subscribe(listener: (state: GameState) => void): () => void;
  joinGame(name: string, roomCode?: string, avatarUrl?: string): void;
  toggleReady(): void;
  toggleWantsMayor(): void;
  startGame(): void;
  submitToken(type: TokenType, targetPlayerId?: string): void;
  submitGuess(text: string): void;
  chooseWord(word: string): void;
  vote(targetId: string): void;
  resetGame(): void;
  listRooms(): void;
  addBot(): void;
  onRoomList(listener: (rooms: RoomInfo[]) => void): () => void;
}

// Protocol: Messages sent FROM Frontend TO Backend
export type ClientMessage = 
  | { type: 'JOIN_GAME'; payload: { name: string; roomCode?: string; avatarUrl?: string } }
  | { type: 'TOGGLE_READY' }
  | { type: 'TOGGLE_WANTS_MAYOR' }
  | { type: 'START_GAME' }
  | { type: 'SUBMIT_TOKEN'; payload: { tokenType: TokenType; targetPlayerId?: string } }
  | { type: 'SUBMIT_GUESS'; payload: { text: string } }
  | { type: 'CHOOSE_WORD'; payload: { word: string } }
  | { type: 'VOTE'; payload: { targetId: string } }
  | { type: 'RESET_GAME' }
  | { type: 'LIST_ROOMS' }
  | { type: 'ADD_BOT' };

// Protocol: Messages sent FROM Backend TO Frontend
export type ServerMessage = 
  | { type: 'STATE_UPDATE'; payload: GameState }
  | { type: 'ERROR'; payload: { message: string } }
  | { type: 'ROOM_LIST'; payload: { rooms: RoomInfo[] } };
