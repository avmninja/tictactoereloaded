import { GameState, WeaponType, GameStateData, GameResult, Player, CellState, Weapon, GameBoard } from '../types';
import { marvelWeapons, dcWeapons } from '../data/weapons';

export class LocalGameManager {
  private gameState: GameStateData;
  private gameResult: GameResult | null = null;
  private onGameStateChange: (state: GameStateData) => void;
  private onGameResult: (result: GameResult) => void;
  private isAIOpponent: boolean;

  constructor(
    gameMode: 'single_player' | 'local_multiplayer',
    playerName: string,
    playerType: WeaponType,
    onGameStateChange: (state: GameStateData) => void,
    onGameResult: (result: GameResult) => void,
    aiOpponentName: string = 'AI Opponent'
  ) {
    this.onGameStateChange = onGameStateChange;
    this.onGameResult = onGameResult;
    this.isAIOpponent = gameMode === 'single_player';

    // Initialize game state
    this.gameState = {
      id: 'local-game-' + Date.now(),
      state: GameState.WEAPON_SELECTION,
      players: [
        {
          id: 'player1',
          name: playerName,
          type: playerType,
          weapons: [],
          isReady: false,
          symbol: playerType === WeaponType.MARVEL ? '🦸‍♂️' : '🦸‍♀️',
          usedWeapons: [],
          roundWins: 0
        },
        {
          id: 'player2',
          name: gameMode === 'single_player' ? aiOpponentName : 'Player 2',
          type: playerType === WeaponType.MARVEL ? WeaponType.DC : WeaponType.MARVEL,
          weapons: [],
          isReady: false,
          symbol: playerType === WeaponType.MARVEL ? '🦸‍♀️' : '🦸‍♂️',
          usedWeapons: [],
          roundWins: 0
        }
      ],
      board: this.createEmptyBoard(),
      currentPlayer: 1,
      roundNumber: 1,
      maxRounds: 10
    };

    // AI selects weapon immediately if it's AI mode
    if (this.isAIOpponent) {
      this.selectAIWeapon();
    }

    this.notifyStateChange();
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

  private getAvailableWeapons(player: Player): Weapon[] {
    const allWeapons = player.type === WeaponType.MARVEL ? marvelWeapons : dcWeapons;
    return allWeapons.filter(weapon => !player.usedWeapons.includes(weapon.id));
  }

  private selectAIWeapon(): void {
    const aiPlayer = this.gameState.players[1];
    const availableWeapons = this.getAvailableWeapons(aiPlayer);
    
    if (availableWeapons.length === 0) return;

    // AI selects a random weapon for simplicity
    const randomWeapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
    aiPlayer.selectedWeapon = randomWeapon;
    aiPlayer.isReady = true;
  }

  public selectWeapon(playerId: string, weaponId: string): boolean {
    if (this.gameState.state !== GameState.WEAPON_SELECTION) {
      return false;
    }

    // For local multiplayer, we need to allow both players to select weapons
    // For single player, only player1 can select (AI selects automatically)
    let player: Player;
    
    if (this.isAIOpponent) {
      // Single player mode - only player1 can select
      player = this.gameState.players.find(p => p.id === 'player1')!;
    } else {
      // Local multiplayer mode - find the player who hasn't selected yet
      const unreadyPlayer = this.gameState.players.find(p => !p.isReady);
      if (!unreadyPlayer) {
        return false; // Both players already selected
      }
      player = unreadyPlayer;
    }

    const availableWeapons = this.getAvailableWeapons(player);
    const weapon = availableWeapons.find(w => w.id === weaponId);
    
    if (!weapon) {
      return false;
    }

    player.selectedWeapon = weapon;
    player.isReady = true;

    // Check if both players are ready
    if (this.gameState.players.every(p => p.isReady)) {
      this.startRound();
    }

    this.notifyStateChange();
    return true;
  }

  private startRound(): void {
    this.gameState.state = GameState.PLAYING;
    this.gameState.board = this.createEmptyBoard();
    
    // Alternate starting player each round: Marvel starts odd rounds, DC starts even rounds
    const marvelPlayerIndex = this.gameState.players.findIndex(p => p.type === WeaponType.MARVEL);
    const dcPlayerIndex = this.gameState.players.findIndex(p => p.type === WeaponType.DC);
    
    if (marvelPlayerIndex !== -1 && dcPlayerIndex !== -1) {
      // Both players found, alternate based on round number
      if (this.gameState.roundNumber % 2 === 1) {
        // Odd rounds: Marvel starts
        this.gameState.currentPlayer = marvelPlayerIndex + 1;
      } else {
        // Even rounds: DC starts
        this.gameState.currentPlayer = dcPlayerIndex + 1;
      }
    } else {
      // Fallback to player 1 if something goes wrong
      this.gameState.currentPlayer = 1;
    }
    
    this.notifyStateChange();
    
    // If it's AI's turn to start the round, make AI move after a short delay
    if (this.isAIOpponent && this.gameState.currentPlayer === 2) {
      setTimeout(() => {
        this.makeAIMove();
      }, 1000); // Slightly longer delay to let UI update first
    }
  }

  public makeMove(playerId: string, row: number, col: number): boolean {
    if (this.gameState.state !== GameState.PLAYING) {
      return false;
    }

    // Validate that it's the correct player's turn
    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || playerIndex + 1 !== this.gameState.currentPlayer) {
      return false;
    }

    if (this.gameState.board.cells[row][col] !== CellState.EMPTY) {
      return false;
    }

    // Make the move
    this.gameState.board.cells[row][col] = this.gameState.currentPlayer as CellState;

    // Check for winner
    const winner = this.checkWinner();
    if (winner) {
      this.gameState.board.winner = winner;
      this.gameState.board.winningCells = this.getWinningCells();
      this.endRound();
    } else if (this.isBoardFull()) {
      this.gameState.board.isDraw = true;
      this.endRound();
    } else {
      // Switch players
      this.gameState.currentPlayer = this.gameState.currentPlayer === 1 ? 2 : 1;
      
      // If it's AI's turn, make AI move after a short delay
      if (this.isAIOpponent && this.gameState.currentPlayer === 2) {
        setTimeout(() => {
          this.makeAIMove();
        }, 500);
      }
    }

    this.notifyStateChange();
    return true;
  }

  private makeAIMove(): void {
    if (this.gameState.state !== GameState.PLAYING || this.gameState.currentPlayer !== 2) {
      return;
    }

    // Simple AI: Try to win, then block player from winning, then random move
    const bestMove = this.findBestMove();
    if (bestMove) {
      this.makeMove('player2', bestMove.row, bestMove.col);
    }
  }

  private findBestMove(): { row: number, col: number } | null {
    const board = this.gameState.board.cells;
    
    // Check for winning move
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === CellState.EMPTY) {
          board[row][col] = CellState.PLAYER2;
          if (this.checkWinner() === 2) {
            board[row][col] = CellState.EMPTY;
            return { row, col };
          }
          board[row][col] = CellState.EMPTY;
        }
      }
    }

    // Check for blocking move
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === CellState.EMPTY) {
          board[row][col] = CellState.PLAYER1;
          if (this.checkWinner() === 1) {
            board[row][col] = CellState.EMPTY;
            return { row, col };
          }
          board[row][col] = CellState.EMPTY;
        }
      }
    }

    // Take center if available
    if (board[1][1] === CellState.EMPTY) {
      return { row: 1, col: 1 };
    }

    // Take corners
    const corners = [
      { row: 0, col: 0 },
      { row: 0, col: 2 },
      { row: 2, col: 0 },
      { row: 2, col: 2 }
    ];
    for (const corner of corners) {
      if (board[corner.row][corner.col] === CellState.EMPTY) {
        return corner;
      }
    }

    // Take any available spot
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === CellState.EMPTY) {
          return { row, col };
        }
      }
    }

    return null;
  }

  private checkWinner(): number | null {
    const { cells } = this.gameState.board;
    
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
    const { cells } = this.gameState.board;
    
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
    return this.gameState.board.cells.every(row => row.every(cell => cell !== CellState.EMPTY));
  }

  private endRound(): void {
    this.gameState.state = GameState.ROUND_END;
    this.generateGameResult();
    this.notifyStateChange();
  }

  private generateGameResult(): void {
    const winnerIndex = this.gameState.board.winner ? this.gameState.board.winner - 1 : null;
    const winner = winnerIndex !== null ? this.gameState.players[winnerIndex] : null;
    const loser = winnerIndex !== null ? this.gameState.players[1 - winnerIndex] : null;
    
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
        loser.weapons.push(transferredWeapon);
      }
      
      loser.weapons = loser.weapons.filter(w => w.id !== transferredWeapon!.id);
      winner.weapons.push(transferredWeapon);
    }

    this.gameResult = {
      winner,
      loser,
      transferredWeapon,
      isGameOver,
      gameWinner
    };

    this.onGameResult(this.gameResult);
  }

  public nextRound(): void {
    if (this.gameState.state !== GameState.ROUND_END) {
      return;
    }

    // Add selected weapons to used weapons list
    this.gameState.players.forEach(player => {
      if (player.selectedWeapon) {
        player.usedWeapons.push(player.selectedWeapon.id);
      }
      player.isReady = false;
      player.selectedWeapon = undefined;
    });

    // Check if all weapons are exhausted
    const allWeaponsUsed = this.gameState.players.every(player => {
      return player.usedWeapons.length >= 5;
    });

    if (allWeaponsUsed) {
      // Determine winner based on round wins
      let gameWinner: Player | undefined;
      if (this.gameState.players[0].roundWins > this.gameState.players[1].roundWins) {
        gameWinner = this.gameState.players[0];
      } else if (this.gameState.players[1].roundWins > this.gameState.players[0].roundWins) {
        gameWinner = this.gameState.players[1];
      }
      
      if (this.gameResult) {
        this.gameResult.isGameOver = true;
        this.gameResult.gameWinner = gameWinner;
        this.onGameResult(this.gameResult);
      }
      
      this.gameState.state = GameState.GAME_OVER;
      this.notifyStateChange();
      return;
    }

    this.gameState.roundNumber++;
    this.gameState.state = GameState.WEAPON_SELECTION;
    this.gameResult = null;

    // AI selects weapon for next round
    if (this.isAIOpponent) {
      this.selectAIWeapon();
    }

    this.notifyStateChange();
  }

  public getGameState(): GameStateData {
    return { ...this.gameState };
  }

  public getGameResult(): GameResult | null {
    return this.gameResult;
  }

  private notifyStateChange(): void {
    this.onGameStateChange({ ...this.gameState });
  }
} 