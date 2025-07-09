import { Weapon, WeaponType, marvelWeapons, dcWeapons } from './Weapon';

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

export class Game {
  public id: string;
  public state: GameState;
  public players: Player[];
  public board: GameBoard;
  public currentPlayer: number;
  public roundNumber: number;
  public maxRounds: number;
  public createdAt: Date;
  public lastResult?: GameResult;
  
  constructor(id: string, maxRounds: number = 10) {
    this.id = id;
    this.state = GameState.WAITING_FOR_PLAYERS;
    this.players = [];
    this.board = this.createEmptyBoard();
    this.currentPlayer = 1;
    this.roundNumber = 1;
    this.maxRounds = maxRounds;
    this.createdAt = new Date();
  }

  private createEmptyBoard(): GameBoard {
    return {
      cells: [
        [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY]
      ],
      winner: null,
      isDraw: false,
      winningCells: []
    };
  }

  public addPlayer(playerId: string, name: string, type: WeaponType): boolean {
    if (this.players.length >= 2) {
      return false;
    }

    const player: Player = {
      id: playerId,
      name,
      type,
      weapons: [],
      isReady: false,
      symbol: type === WeaponType.MARVEL ? '🦸‍♂️' : '🦸‍♀️'
    };

    this.players.push(player);
    
    if (this.players.length === 2) {
      this.state = GameState.WEAPON_SELECTION;
    }
    
    return true;
  }

  public selectWeapon(playerId: string, weaponId: string): boolean {
    const player = this.players.find(p => p.id === playerId);
    if (!player || this.state !== GameState.WEAPON_SELECTION) {
      return false;
    }

    // Find weapon from player's available weapons (their universe)
    const availableWeapons = this.getAvailableWeapons(player.type);
    const weapon = availableWeapons.find(w => w.id === weaponId);
    
    if (!weapon) {
      return false;
    }

    player.selectedWeapon = weapon;
    player.isReady = true;

    // Check if both players are ready
    if (this.players.every(p => p.isReady)) {
      this.startRound();
    }

    return true;
  }

  private getAvailableWeapons(type: WeaponType): Weapon[] {
    // Use the imported weapon arrays
    return type === WeaponType.MARVEL ? marvelWeapons : dcWeapons;
  }

  private startRound(): void {
    this.state = GameState.PLAYING;
    this.board = this.createEmptyBoard();
    this.currentPlayer = 1;
  }

  public makeMove(playerId: string, row: number, col: number): boolean {
    if (this.state !== GameState.PLAYING) {
      return false;
    }

    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || playerIndex + 1 !== this.currentPlayer) {
      return false;
    }

    if (this.board.cells[row][col] !== CellState.EMPTY) {
      return false;
    }

    // Make the move
    this.board.cells[row][col] = this.currentPlayer as CellState;

    // Check for winner
    const winner = this.checkWinner();
    if (winner) {
      this.board.winner = winner;
      this.board.winningCells = this.getWinningCells();
      this.endRound();
    } else if (this.isBoardFull()) {
      this.board.isDraw = true;
      this.endRound();
    } else {
      // Switch players
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    }

    return true;
  }

  private checkWinner(): number | null {
    const { cells } = this.board;
    
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (cells[row][0] !== CellState.EMPTY && 
          cells[row][0] === cells[row][1] && 
          cells[row][1] === cells[row][2]) {
        return cells[row][0];
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (cells[0][col] !== CellState.EMPTY && 
          cells[0][col] === cells[1][col] && 
          cells[1][col] === cells[2][col]) {
        return cells[0][col];
      }
    }

    // Check diagonals
    if (cells[0][0] !== CellState.EMPTY && 
        cells[0][0] === cells[1][1] && 
        cells[1][1] === cells[2][2]) {
      return cells[0][0];
    }

    if (cells[0][2] !== CellState.EMPTY && 
        cells[0][2] === cells[1][1] && 
        cells[1][1] === cells[2][0]) {
      return cells[0][2];
    }

    return null;
  }

  private getWinningCells(): number[][] {
    const { cells } = this.board;
    
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (cells[row][0] !== CellState.EMPTY && 
          cells[row][0] === cells[row][1] && 
          cells[row][1] === cells[row][2]) {
        return [[row, 0], [row, 1], [row, 2]];
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (cells[0][col] !== CellState.EMPTY && 
          cells[0][col] === cells[1][col] && 
          cells[1][col] === cells[2][col]) {
        return [[0, col], [1, col], [2, col]];
      }
    }

    // Check diagonals
    if (cells[0][0] !== CellState.EMPTY && 
        cells[0][0] === cells[1][1] && 
        cells[1][1] === cells[2][2]) {
      return [[0, 0], [1, 1], [2, 2]];
    }

    if (cells[0][2] !== CellState.EMPTY && 
        cells[0][2] === cells[1][1] && 
        cells[1][1] === cells[2][0]) {
      return [[0, 2], [1, 1], [2, 0]];
    }

    return [];
  }

  private isBoardFull(): boolean {
    return this.board.cells.every(row => row.every(cell => cell !== CellState.EMPTY));
  }

  private endRound(): void {
    this.state = GameState.ROUND_END;
  }

  public getGameResult(): GameResult {
    const winnerIndex = this.board.winner ? this.board.winner - 1 : null;
    const winner = winnerIndex !== null ? this.players[winnerIndex] : null;
    const loser = winnerIndex !== null ? this.players[1 - winnerIndex] : null;
    
    let transferredWeapon: Weapon | undefined;
    let isGameOver = false;
    let gameWinner: Player | undefined;

    // Transfer weapon if there's a winner
    if (winner && loser && loser.selectedWeapon) {
      transferredWeapon = loser.selectedWeapon;
      
      // Remove weapon from loser and add to winner
      const weaponIndex = loser.weapons.findIndex(w => w.id === transferredWeapon!.id);
      if (weaponIndex === -1) {
        // If loser doesn't have the weapon in their collection, add it first
        loser.weapons.push(transferredWeapon);
      }
      
      // Remove from loser
      loser.weapons = loser.weapons.filter(w => w.id !== transferredWeapon!.id);
      
      // Add to winner
      winner.weapons.push(transferredWeapon);
      
      // Check if game is over (winner has 5 weapons)
      if (winner.weapons.length >= 5) {
        isGameOver = true;
        gameWinner = winner;
        this.state = GameState.GAME_OVER;
      }
    }

    this.lastResult = {
      winner,
      loser,
      transferredWeapon,
      isGameOver,
      gameWinner
    };

    return this.lastResult;
  }

  public nextRound(): void {
    if (this.state !== GameState.ROUND_END) {
      return;
    }

    // Reset player ready states
    this.players.forEach(player => {
      player.isReady = false;
      player.selectedWeapon = undefined;
    });

    this.roundNumber++;
    this.state = GameState.WEAPON_SELECTION;
  }

  public getState() {
    return {
      id: this.id,
      state: this.state,
      players: this.players.map(player => ({
        ...player,
        // Don't expose opponent's weapons in detail during game
        weapons: player.weapons.length > 0 ? player.weapons : []
      })),
      board: this.board,
      currentPlayer: this.currentPlayer,
      roundNumber: this.roundNumber,
      maxRounds: this.maxRounds
    };
  }
} 