import { GameState, GamePhase, Role, TokenType, TokenAction, GameService, RoomInfo } from '../types';
import { generateSecretWord } from './geminiService';
import { audioService } from './audioService';

type Listener = (state: GameState) => void;

// Simple UUID generator fallback for non-secure contexts
const uuidv4 = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

class MockGameService implements GameService {
  private state: GameState;
  private listeners: Set<Listener> = new Set();
  private intervalId: any = null;
  private botIntervalId: any = null;

  constructor() {
    this.state = {
      phase: GamePhase.LOGIN,
      roomCode: '',
      players: [],
      secretWord: '',
      timeRemaining: 0,
      tokensUsed: 0,
      tokenHistory: [],
      guesses: [],
      myPlayerId: null,
    };
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  // --- Interface Methods ---

  listRooms() { /* no-op in mock */ }
  addBot() { /* no-op in mock */ }
  submitGuess(_text: string) { /* no-op in mock */ }
  chooseWord(_word: string) { /* no-op in mock */ }
  toggleWantsMayor() { /* no-op in mock */ }
  onRoomList(_listener: (rooms: RoomInfo[]) => void) { return () => {}; }

  joinGame(name: string, _roomCode?: string, _avatarUrl?: string) {
    const newPlayerId = uuidv4();
    this.state.myPlayerId = newPlayerId;
    this.state.players = [
      { id: newPlayerId, name, role: Role.VILLAGER, isMayor: false, isReady: false, avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newPlayerId}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`, votesReceived: 0 },
    ];
    this.state.roomCode = 'WOLF-' + Math.floor(1000 + Math.random() * 9000);
    this.state.phase = GamePhase.LOBBY;
    
    // Simulate other players joining
    setTimeout(() => this.addSimBot("Alex"), 1000);
    setTimeout(() => this.addSimBot("Sam"), 2000);
    setTimeout(() => this.addSimBot("Jordan"), 3000);
    
    this.notify();
  }

  toggleReady() {
    const myPlayer = this.state.players.find(p => p.id === this.state.myPlayerId);
    if (myPlayer) {
      myPlayer.isReady = !myPlayer.isReady;
      audioService.playPop();
      this.notify();
    }
  }

  async startGame() {
    audioService.playSuccess();
    // Assign Roles
    const players = [...this.state.players];
    const roles = [Role.WEREWOLF, Role.SEER, Role.VILLAGER, Role.VILLAGER];
    
    // Shuffle roles
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    // Force Local Player to be Mayor for Demo purposes
    let mayorIndex = players.findIndex(p => p.id === this.state.myPlayerId);
    if (mayorIndex === -1) mayorIndex = 0; 
    
    players.forEach((p, idx) => {
      p.role = roles[idx % roles.length];
      p.isMayor = idx === mayorIndex;
      p.votesReceived = 0;
    });

    this.state.players = players;
    
    // Get Word from Gemini (or fallback)
    this.state.secretWord = await generateSecretWord('MEDIUM');
    this.state.timeRemaining = 240;
    this.state.tokensUsed = 0;
    this.state.tokenHistory = [];
    
    this.state.phase = GamePhase.ROLE_REVEAL;
    this.notify();

    setTimeout(() => {
        if (this.state.phase === GamePhase.ROLE_REVEAL) {
            this.state.phase = GamePhase.DAY_PHASE;
            audioService.playSuccess(); // Gong sound
            this.startTimer();
            
            const myPlayer = this.state.players.find(p => p.id === this.state.myPlayerId);
            if (!myPlayer?.isMayor) {
                this.startBotMayor();
            }
            this.notify();
        }
    }, 8000);
  }

  submitToken(type: TokenType, _targetPlayerId?: string) {
      if (type === TokenType.CORRECT) {
          audioService.playSuccess();
      } else {
          audioService.playPop();
      }

      const nonMayors = this.state.players.filter(p => !p.isMayor);
      const randomAsker = nonMayors.length > 0 
        ? nonMayors[Math.floor(Math.random() * nonMayors.length)] 
        : null;

      const token: TokenAction = {
          id: uuidv4(),
          type,
          timestamp: Date.now(),
          targetPlayerId: randomAsker?.id
      };
      this.state.tokenHistory.unshift(token);
      this.state.tokensUsed++;

      if (type === TokenType.CORRECT) {
          this.endGame('VILLAGE'); 
      } else {
          this.notify();
      }
  }

  vote(targetId: string) {
     if (this.state.myPlayerId) {
         this.handleInternalVote(this.state.myPlayerId, targetId);
     }
  }

  resetGame() {
      this.state.phase = GamePhase.LOBBY;
      this.state.players.forEach(p => {
          p.isReady = false;
          p.votesReceived = 0;
      });
      this.state.secretWord = '';
      this.state.tokenHistory = [];
      this.notify();
  }

  // --- Internal Simulation Logic ---

  private addSimBot(name: string) {
    const id = uuidv4();
    this.state.players.push({
      id,
      name,
      role: Role.VILLAGER,
      isMayor: false,
      isReady: true,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${id}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
      votesReceived: 0
    });
    this.notify();
  }

  private startTimer() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
        if (this.state.phase !== GamePhase.DAY_PHASE) {
            clearInterval(this.intervalId);
            if (this.botIntervalId) clearInterval(this.botIntervalId);
            return;
        }
        if (this.state.timeRemaining > 0) {
            this.state.timeRemaining--;
            if (this.state.timeRemaining <= 10) audioService.playTick();
            this.notify();
        } else {
            this.startVotingPhase();
        }
    }, 1000);
  }

  private startBotMayor() {
      if (this.botIntervalId) clearInterval(this.botIntervalId);
      this.botIntervalId = setInterval(() => {
          if (this.state.phase !== GamePhase.DAY_PHASE) {
              clearInterval(this.botIntervalId);
              return;
          }
          const randomType = [TokenType.YES, TokenType.NO, TokenType.MAYBE, TokenType.SO_CLOSE, TokenType.WAY_OFF];
          const type = randomType[Math.floor(Math.random() * randomType.length)];
          this.submitToken(type);
      }, 3000);
  }

  private startVotingPhase() {
      clearInterval(this.intervalId);
      if (this.botIntervalId) clearInterval(this.botIntervalId);
      
      this.state.phase = GamePhase.VOTING;
      audioService.playWarning();
      this.notify();

      this.state.players.filter(p => p.id !== this.state.myPlayerId).forEach(bot => {
          setTimeout(() => {
              const targets = this.state.players.filter(p => p.id !== bot.id);
              const target = targets[Math.floor(Math.random() * targets.length)];
              this.handleInternalVote(bot.id, target.id);
          }, Math.random() * 5000 + 2000);
      });
  }

  private handleInternalVote(voterId: string, targetId: string) {
      if (this.state.phase !== GamePhase.VOTING) return;
      
      const target = this.state.players.find(p => p.id === targetId);
      if (target) {
          target.votesReceived = (target.votesReceived || 0) + 1;
          audioService.playPop();
          
          const totalVotes = this.state.players.reduce((acc, p) => acc + (p.votesReceived || 0), 0);
          
          if (totalVotes >= this.state.players.length) {
              this.resolveVoting();
          } else {
              this.notify();
          }
      }
  }

  private resolveVoting() {
      const sorted = [...this.state.players].sort((a, b) => (b.votesReceived || 0) - (a.votesReceived || 0));
      const mostVoted = sorted[0];

      if (mostVoted.role === Role.WEREWOLF) {
          this.endGame('VILLAGE');
      } else {
          this.endGame('WEREWOLF');
      }
  }

  private endGame(winner: 'VILLAGE' | 'WEREWOLF') {
      clearInterval(this.intervalId);
      if (this.botIntervalId) clearInterval(this.botIntervalId);
      
      if (winner === 'VILLAGE') audioService.playSuccess();
      else audioService.playError();

      this.state.winner = winner;
      this.state.phase = GamePhase.GAME_OVER;
      this.notify();
  }
}

export const mockGameService = new MockGameService();
