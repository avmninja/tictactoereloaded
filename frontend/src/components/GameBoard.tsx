import React from 'react';
import { motion } from 'framer-motion';
import { GameStateData, CellState } from '../types';

interface GameBoardProps {
  gameState: GameStateData;
  onMove: (row: number, col: number) => void;
  isMyTurn: boolean;
  playerId: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onMove, isMyTurn, playerId }) => {
  const { board } = gameState;

  const getCellContent = (cellState: CellState) => {
    if (cellState === CellState.PLAYER1) {
      // Player 1 is always the first player in the array
      const player1 = gameState.players[0];
      if (player1?.selectedWeapon && player1.selectedWeapon.imageUrl) {
        return (
          <div className="relative w-12 h-12 flex items-center justify-center">
            <img
              src={player1.selectedWeapon.imageUrl}
              alt={player1.selectedWeapon.name}
              className="w-10 h-10 object-contain rounded-md drop-shadow-md"
              onError={(e) => {
                console.error('Failed to load weapon image:', player1.selectedWeapon!.imageUrl);
                // Fallback to emoji if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback-emoji') as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <span className="fallback-emoji hidden text-2xl">🦸‍♂️</span>
          </div>
        );
      }
      return '🦸‍♂️';
    }
    if (cellState === CellState.PLAYER2) {
      // Player 2 is always the second player in the array
      const player2 = gameState.players[1];
      if (player2?.selectedWeapon && player2.selectedWeapon.imageUrl) {
        return (
          <div className="relative w-12 h-12 flex items-center justify-center">
            <img
              src={player2.selectedWeapon.imageUrl}
              alt={player2.selectedWeapon.name}
              className="w-10 h-10 object-contain rounded-md drop-shadow-md"
              onError={(e) => {
                console.error('Failed to load weapon image:', player2.selectedWeapon!.imageUrl);
                // Fallback to emoji if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback-emoji') as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <span className="fallback-emoji hidden text-2xl">🦸‍♀️</span>
          </div>
        );
      }
      return '🦸‍♀️';
    }
    return '';
  };

  const isWinningCell = (row: number, col: number) => {
    return board.winningCells.some(([r, c]) => r === row && c === col);
  };

  const getCellClassName = (row: number, col: number, cellState: CellState) => {
    let className = `
      board-cell w-24 h-24 bg-game-card border-2 border-game-border rounded-lg
      flex items-center justify-center text-4xl font-bold cursor-pointer
      hover:border-blue-500 transition-all duration-200 relative
    `;

    if (cellState !== CellState.EMPTY) {
      className += ' cursor-not-allowed';
    }

    if (isWinningCell(row, col)) {
      className += ' winning border-yellow-400 bg-yellow-400/20';
    }

    if (!isMyTurn) {
      className += ' cursor-not-allowed opacity-75';
    }

    return className;
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn || board.cells[row][col] !== CellState.EMPTY) {
      return;
    }
    onMove(row, col);
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-game-card rounded-2xl p-6 border border-game-border shadow-xl"
      >
        <div className="grid grid-cols-3 gap-3">
          {board.cells.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                whileHover={isMyTurn && cell === CellState.EMPTY ? { scale: 1.05 } : {}}
                whileTap={isMyTurn && cell === CellState.EMPTY ? { scale: 0.95 } : {}}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={getCellClassName(rowIndex, colIndex, cell)}
              >
                {getCellContent(cell)}
              </motion.button>
            ))
          )}
        </div>
      </motion.div>

      <div className="mt-4 text-center">
        <div className={`text-lg font-medium ${isMyTurn ? 'text-green-400' : 'text-yellow-400'}`}>
          {isMyTurn ? 'Your Turn' : 'Opponent\'s Turn'}
        </div>
        {board.winner && (
          <div className="text-sm text-gray-400 mt-1">
            Winner: Player {board.winner}
          </div>
        )}
        {board.isDraw && (
          <div className="text-sm text-gray-400 mt-1">
            It's a draw!
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard; 