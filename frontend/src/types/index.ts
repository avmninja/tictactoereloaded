export enum WeaponType {
  MARVEL = 'marvel',
  DC = 'dc'
}

export interface Weapon {
  id: string;
  name: string;
  universe: 'Marvel' | 'DC';
  power: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl: string;
}

export enum GameState {
  WAITING_FOR_PLAYERS = 'waiting_for_players',
  WEAPON_SELECTION = 'weapon_selection',
  PLAYING = 'playing',
  ROUND_END = 'round_end',
  GAME_OVER = 'game_over'
}

export enum CellState {
  EMPTY = 0,
  PLAYER1 = 1,
  PLAYER2 = 2
}

export interface Player {
  id: string;
  name: string;
  type: WeaponType;
  weapons: Weapon[];
  selectedWeapon?: Weapon;
  isReady: boolean;
  symbol: string;
}

export interface GameBoard {
  cells: CellState[][];
  winner: number | null;
  isDraw: boolean;
  winningCells: number[][];
}

export interface GameResult {
  winner: Player | null;
  loser: Player | null;
  transferredWeapon?: Weapon;
  isGameOver: boolean;
  gameWinner?: Player;
}

export interface GameStateData {
  id: string;
  state: GameState;
  players: Player[];
  board: GameBoard;
  currentPlayer: number;
  roundNumber: number;
  maxRounds: number;
}

export interface SocketEvents {
  'game-joined': (data: { gameId: string, playerId: string, gameState: GameStateData }) => void;
  'game-updated': (gameState: GameStateData) => void;
  'round-ended': (result: GameResult) => void;
  'player-disconnected': (data: { playerId: string }) => void;
  'error': (data: { message: string }) => void;
} 