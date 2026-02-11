import { GameService } from '../types';
import { mockGameService } from './mockSocket';
import { liveGameService } from './liveSocket';

// --- CONFIGURATION ---

// Set this to true to use the real WebSocket backend.
// Set this to false to use the in-browser simulation.
const USE_REAL_BACKEND = true; 

// ---------------------

export const gameService: GameService = USE_REAL_BACKEND ? liveGameService : mockGameService;

console.log(`[GameService] Using ${USE_REAL_BACKEND ? 'Live WebSocket' : 'Mock Simulation'} Service`);
