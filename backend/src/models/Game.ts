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
  usedWeapons: string[]; // Track weapon IDs that have been used by this player
  roundWins: number; // Track number of rounds won by this player
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
      symbol: type === WeaponType.MARVEL ? '🦸‍♂️' : '🦸‍♀️',
      usedWeapons: [],
      roundWins: 0
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
    const availableWeapons = this.getAvailableWeapons(player.type, player);
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

  private getAvailableWeapons(type: WeaponType, player: Player): Weapon[] {
    // Use the imported weapon arrays
    const allWeapons = type === WeaponType.MARVEL ? marvelWeapons : dcWeapons;
    // Filter out weapons that have already been used by this player
    return allWeapons.filter(weapon => !player.usedWeapons.includes(weapon.id));
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

    // Increment round wins for the winner
    if (winner) {
      winner.roundWins++;
    }

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
    }

    // Game over check will happen in nextRound() after weapons are marked as used

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

    // Add selected weapons to used weapons list before clearing
    this.players.forEach(player => {
      if (player.selectedWeapon) {
        player.usedWeapons.push(player.selectedWeapon.id);
      }
      player.isReady = false;
      player.selectedWeapon = undefined;
    });

    // Check if all weapons are exhausted (both players have used all their weapons)
    const allWeaponsUsed = this.players.every(player => {
      const totalWeapons = player.type === WeaponType.MARVEL ? 5 : 5; // Both Marvel and DC have 5 weapons
      return player.usedWeapons.length >= totalWeapons;
    });

    if (allWeaponsUsed) {
      // Determine winner based on round wins
      let gameWinner: Player | undefined;
      if (this.players[0].roundWins > this.players[1].roundWins) {
        gameWinner = this.players[0];
      } else if (this.players[1].roundWins > this.players[0].roundWins) {
        gameWinner = this.players[1];
      } else {
        // It's a tie - no clear winner
        gameWinner = undefined;
      }
      
      // Update the last result to indicate game over
      this.lastResult = {
        ...this.lastResult!,
        isGameOver: true,
        gameWinner
      };
      
      this.state = GameState.GAME_OVER;
      return;
    }

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