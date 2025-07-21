"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.CellState = exports.GameState = void 0;
const Weapon_1 = require("./Weapon");
var GameState;
(function (GameState) {
    GameState["WAITING_FOR_PLAYERS"] = "waiting_for_players";
    GameState["WEAPON_SELECTION"] = "weapon_selection";
    GameState["PLAYING"] = "playing";
    GameState["ROUND_END"] = "round_end";
    GameState["GAME_OVER"] = "game_over";
})(GameState || (exports.GameState = GameState = {}));
var CellState;
(function (CellState) {
    CellState[CellState["EMPTY"] = 0] = "EMPTY";
    CellState[CellState["PLAYER1"] = 1] = "PLAYER1";
    CellState[CellState["PLAYER2"] = 2] = "PLAYER2";
})(CellState || (exports.CellState = CellState = {}));
class Game {
    constructor(id, maxRounds = 10) {
        this.id = id;
        this.state = GameState.WAITING_FOR_PLAYERS;
        this.players = [];
        this.board = this.createEmptyBoard();
        this.currentPlayer = 1;
        this.roundNumber = 1;
        this.maxRounds = maxRounds;
        this.createdAt = new Date();
        this.lastActivity = Date.now();
    }
    createEmptyBoard() {
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
    addPlayer(playerId, name, type) {
        if (this.players.length >= 2) {
            return { success: false, error: 'Game is full' };
        }
        // Check if second player is trying to select the same universe as first player
        if (this.players.length === 1) {
            const firstPlayerType = this.players[0].type;
            if (firstPlayerType === type) {
                const oppositeUniverse = firstPlayerType === Weapon_1.WeaponType.MARVEL ? 'DC' : 'Marvel';
                return {
                    success: false,
                    error: `Universe already taken! Please choose ${oppositeUniverse} instead.`
                };
            }
        }
        const player = {
            id: playerId,
            name,
            type,
            weapons: [],
            isReady: false,
            symbol: type === Weapon_1.WeaponType.MARVEL ? '🦸‍♂️' : '🦸‍♀️',
            usedWeapons: [],
            roundWins: 0
        };
        this.players.push(player);
        this.updateLastActivity();
        if (this.players.length === 2) {
            this.state = GameState.WEAPON_SELECTION;
        }
        return { success: true };
    }
    selectWeapon(playerId, weaponId) {
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
        this.updateLastActivity();
        // Check if both players are ready
        if (this.players.every(p => p.isReady)) {
            this.startRound();
        }
        return true;
    }
    getAvailableWeapons(type, player) {
        // Use the imported weapon arrays
        const allWeapons = type === Weapon_1.WeaponType.MARVEL ? Weapon_1.marvelWeapons : Weapon_1.dcWeapons;
        // Filter out weapons that have already been used by this player
        return allWeapons.filter(weapon => !player.usedWeapons.includes(weapon.id));
    }
    startRound() {
        this.state = GameState.PLAYING;
        this.board = this.createEmptyBoard();
        // Alternate starting player each round: Marvel starts odd rounds, DC starts even rounds
        const marvelPlayerIndex = this.players.findIndex(p => p.type === Weapon_1.WeaponType.MARVEL);
        const dcPlayerIndex = this.players.findIndex(p => p.type === Weapon_1.WeaponType.DC);
        if (marvelPlayerIndex !== -1 && dcPlayerIndex !== -1) {
            // Both players found, alternate based on round number
            if (this.roundNumber % 2 === 1) {
                // Odd rounds: Marvel starts
                this.currentPlayer = marvelPlayerIndex + 1;
            }
            else {
                // Even rounds: DC starts
                this.currentPlayer = dcPlayerIndex + 1;
            }
        }
        else {
            // Fallback to player 1 if something goes wrong
            this.currentPlayer = 1;
        }
    }
    makeMove(playerId, row, col) {
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
        this.board.cells[row][col] = this.currentPlayer;
        this.updateLastActivity();
        // Check for winner
        const winner = this.checkWinner();
        if (winner) {
            this.board.winner = winner;
            this.board.winningCells = this.getWinningCells();
            this.endRound();
        }
        else if (this.isBoardFull()) {
            this.board.isDraw = true;
            this.endRound();
        }
        else {
            // Switch players
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        }
        return true;
    }
    checkWinner() {
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
    getWinningCells() {
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
    isBoardFull() {
        return this.board.cells.every(row => row.every(cell => cell !== CellState.EMPTY));
    }
    endRound() {
        this.state = GameState.ROUND_END;
    }
    getGameResult() {
        const winnerIndex = this.board.winner ? this.board.winner - 1 : null;
        const winner = winnerIndex !== null ? this.players[winnerIndex] : null;
        const loser = winnerIndex !== null ? this.players[1 - winnerIndex] : null;
        let transferredWeapon;
        let isGameOver = false;
        let gameWinner;
        // Only process result if it hasn't been processed yet
        if (!this.lastResult) {
            // Increment round wins for the winner (only once per round)
            if (winner) {
                winner.roundWins++;
            }
            // Transfer weapon if there's a winner
            if (winner && loser && loser.selectedWeapon) {
                transferredWeapon = loser.selectedWeapon;
                // Remove weapon from loser and add to winner
                const weaponIndex = loser.weapons.findIndex(w => w.id === transferredWeapon.id);
                if (weaponIndex === -1) {
                    // If loser doesn't have the weapon in their collection, add it first
                    loser.weapons.push(transferredWeapon);
                }
                // Remove from loser
                loser.weapons = loser.weapons.filter(w => w.id !== transferredWeapon.id);
                // Add to winner
                winner.weapons.push(transferredWeapon);
            }
            this.lastResult = {
                winner,
                loser,
                transferredWeapon,
                isGameOver,
                gameWinner
            };
        }
        return this.lastResult;
    }
    nextRound() {
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
        // Clear the last result for the next round
        this.lastResult = undefined;
        // Check if all weapons are exhausted (both players have used all their weapons)
        const allWeaponsUsed = this.players.every(player => {
            const totalWeapons = player.type === Weapon_1.WeaponType.MARVEL ? 5 : 5; // Both Marvel and DC have 5 weapons
            return player.usedWeapons.length >= totalWeapons;
        });
        if (allWeaponsUsed) {
            // Determine winner based on round wins
            let gameWinner;
            if (this.players[0].roundWins > this.players[1].roundWins) {
                gameWinner = this.players[0];
            }
            else if (this.players[1].roundWins > this.players[0].roundWins) {
                gameWinner = this.players[1];
            }
            else {
                // It's a tie - no clear winner
                gameWinner = undefined;
            }
            // Update the last result to indicate game over
            this.lastResult = {
                ...this.lastResult,
                isGameOver: true,
                gameWinner
            };
            this.state = GameState.GAME_OVER;
            return;
        }
        this.roundNumber++;
        this.state = GameState.WEAPON_SELECTION;
    }
    getState() {
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
    getPlayerCount() {
        return this.players.length;
    }
    getLastActivity() {
        return this.lastActivity;
    }
    updateLastActivity() {
        this.lastActivity = Date.now();
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map