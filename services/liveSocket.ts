import { GameService, GameState, ClientMessage, ServerMessage, GamePhase, TokenType, RoomInfo } from '../types';

const getWsUrl = (): string => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }
  return 'ws://localhost:8080/ws';
};

const WS_URL = getWsUrl();

class LiveGameService implements GameService {
  private socket: WebSocket | null = null;
  private listeners: Set<(state: GameState) => void> = new Set();
  private roomListListeners: Set<(rooms: RoomInfo[]) => void> = new Set();
  private state: GameState;
  private onConnectCallbacks: (() => void)[] = [];

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

  private connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    console.log(`Connecting to WebSocket at ${WS_URL}...`);
    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log('Connected to Game Server');
      this.onConnectCallbacks.forEach(cb => cb());
      this.onConnectCallbacks = [];
    };

    this.socket.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        this.handleServerMessage(message);
      } catch (e) {
        console.error('Failed to parse server message', e);
      }
    };

    this.socket.onclose = () => {
      console.log('Disconnected from Game Server');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error', error);
    };
  }

  private sendMessage(message: ClientMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('Socket not connected. Attempting to connect...');
      this.connect();
      this.onConnectCallbacks.push(() => {
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify(message));
        }
      });
    }
  }

  private handleServerMessage(message: ServerMessage) {
    if (message.type === 'STATE_UPDATE') {
      this.state = message.payload;
      this.notify();
    } else if (message.type === 'ERROR') {
      console.error('Server Error:', message.payload.message);
      alert(message.payload.message);
    } else if (message.type === 'ROOM_LIST') {
      const rooms = (message.payload as { rooms: RoomInfo[] }).rooms;
      this.roomListListeners.forEach(l => l(rooms));
    }
  }

  subscribe(listener: (state: GameState) => void) {
    this.listeners.add(listener);
    listener(this.state);
    this.connect();
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
  }

  joinGame(name: string, roomCode?: string, avatarUrl?: string) {
    this.sendMessage({ type: 'JOIN_GAME', payload: { name, roomCode, avatarUrl } });
  }

  toggleReady() {
    this.sendMessage({ type: 'TOGGLE_READY' });
  }

  toggleWantsMayor() {
    this.sendMessage({ type: 'TOGGLE_WANTS_MAYOR' });
  }

  startGame() {
    this.sendMessage({ type: 'START_GAME' });
  }

  submitToken(type: TokenType, targetPlayerId?: string) {
    this.sendMessage({ type: 'SUBMIT_TOKEN', payload: { tokenType: type, targetPlayerId } });
  }

  submitGuess(text: string) {
    this.sendMessage({ type: 'SUBMIT_GUESS', payload: { text } });
  }

  chooseWord(word: string) {
    this.sendMessage({ type: 'CHOOSE_WORD', payload: { word } });
  }

  vote(targetId: string) {
    this.sendMessage({ type: 'VOTE', payload: { targetId } });
  }

  resetGame() {
    this.sendMessage({ type: 'RESET_GAME' });
  }

  listRooms() {
    this.sendMessage({ type: 'LIST_ROOMS' });
  }

  addBot() {
    this.sendMessage({ type: 'ADD_BOT' });
  }

  onRoomList(listener: (rooms: RoomInfo[]) => void) {
    this.roomListListeners.add(listener);
    return () => this.roomListListeners.delete(listener);
  }
}

export const liveGameService = new LiveGameService();
