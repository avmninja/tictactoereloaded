import { Weapon, WeaponType } from './Weapon';
export declare enum GameState {
    WAITING_FOR_PLAYERS = "waiting_for_players",
    WEAPON_SELECTION = "weapon_selection",
    PLAYING = "playing",
    ROUND_END = "round_end",
    GAME_OVER = "game_over"
}
export declare enum CellState {
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
    usedWeapons: string[];
    roundWins: number;
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
export declare class Game {
    id: string;
    state: GameState;
    players: Player[];
    board: GameBoard;
    currentPlayer: number;
    roundNumber: number;
    maxRounds: number;
    createdAt: Date;
    lastActivity: number;
    lastResult?: GameResult;
    constructor(id: string, maxRounds?: number);
    private createEmptyBoard;
    addPlayer(playerId: string, name: string, type: WeaponType): {
        success: boolean;
        error?: string;
    };
    selectWeapon(playerId: string, weaponId: string): boolean;
    private getAvailableWeapons;
    private startRound;
    makeMove(playerId: string, row: number, col: number): boolean;
    private checkWinner;
    private getWinningCells;
    private isBoardFull;
    private endRound;
    getGameResult(): GameResult;
    nextRound(): void;
    getState(): {
        id: string;
        state: GameState;
        players: {
            weapons: Weapon[];
            id: string;
            name: string;
            type: WeaponType;
            selectedWeapon?: Weapon;
            isReady: boolean;
            symbol: string;
            usedWeapons: string[];
            roundWins: number;
        }[];
        board: GameBoard;
        currentPlayer: number;
        roundNumber: number;
        maxRounds: number;
    };
    getPlayerCount(): number;
    getLastActivity(): number;
    updateLastActivity(): void;
}
//# sourceMappingURL=Game.d.ts.map