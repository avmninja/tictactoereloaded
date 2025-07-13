import React from 'react';
import { motion } from 'framer-motion';
import { GameResult, Player } from '../types';
import { Trophy, Sword, Crown, ArrowRight } from 'lucide-react';

interface GameResultProps {
  result: GameResult;
  currentPlayer: Player | null;
  onNextRound: () => void;
  isGameOver?: boolean;
}

const GameResultComponent: React.FC<GameResultProps> = ({ 
  result, 
  currentPlayer, 
  onNextRound, 
  isGameOver = false 
}) => {
  const isWinner = result.winner?.id === currentPlayer?.id;
  const isLoser = result.loser?.id === currentPlayer?.id;

  const WeaponImage: React.FC<{ imageUrl: string; name: string; size?: string }> = ({ imageUrl, name, size = 'w-8 h-8' }) => (
    <img
      src={imageUrl}
      alt={name}
      className={`${size} object-contain rounded-md border border-game-border`}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
  );

  const WeaponCollection: React.FC<{ weapons: any[], playerName: string, color: string }> = ({ weapons, playerName, color }) => (
    <div className="text-center">
      <div className="font-bold mb-2">{playerName}</div>
      <div className={`text-2xl font-bold ${color} mb-2`}>
        {weapons.length}/5 weapons
      </div>
      {weapons.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {weapons.map((weapon, index) => (
            <motion.div
              key={weapon.id || index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <WeaponImage imageUrl={weapon.imageUrl} name={weapon.name} size="w-8 h-8" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {weapon.name}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-game-card rounded-2xl p-8 border border-game-border shadow-2xl text-center"
      >
        {isGameOver ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <Crown className="w-20 h-20 mx-auto text-yellow-400 victory-text" />
            </motion.div>

            <h2 className="text-4xl font-hero font-bold victory-text mb-4">
              {isWinner ? (
                <span className="text-green-400">🎉 VICTORY! 🎉</span>
              ) : (
                <span className="text-red-400">💀 DEFEAT 💀</span>
              )}
            </h2>

            <p className="text-xl text-gray-300 mb-6">
              {result.gameWinner ? (
                isWinner 
                  ? "All weapons exhausted! You won the most rounds!"
                  : `All weapons exhausted! ${result.gameWinner.name} won the most rounds!`
              ) : (
                "All weapons exhausted! It's a tie - both players won the same number of rounds!"
              )}
            </p>

            <div className="bg-game-bg rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4 text-yellow-400">🏆 Final Round Wins 🏆</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="font-bold mb-2">{currentPlayer?.name}</div>
                  <div className={`text-4xl font-bold ${isWinner ? 'text-green-400' : 'text-red-400'} mb-2`}>
                    {currentPlayer?.roundWins}
                  </div>
                  <div className="text-sm text-gray-400">Round Wins</div>
                </div>
                <div className="text-center">
                  <div className="font-bold mb-2">{result.gameWinner?.id === currentPlayer?.id ? result.loser?.name : result.gameWinner?.name}</div>
                  <div className={`text-4xl font-bold ${!isWinner ? 'text-green-400' : 'text-red-400'} mb-2`}>
                    {result.gameWinner?.id === currentPlayer?.id ? result.loser?.roundWins : result.gameWinner?.roundWins}
                  </div>
                  <div className="text-sm text-gray-400">Round Wins</div>
                </div>
              </div>
            </div>

            <div className="bg-game-bg rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4 text-purple-400">⚔️ Final Weapon Collections ⚔️</h3>
              <div className="grid grid-cols-2 gap-6">
                <WeaponCollection 
                  weapons={currentPlayer?.weapons || []} 
                  playerName={currentPlayer?.name || ''} 
                  color="text-blue-400" 
                />
                <WeaponCollection 
                  weapons={result.gameWinner?.id === currentPlayer?.id ? result.loser?.weapons || [] : result.gameWinner?.weapons || []} 
                  playerName={result.gameWinner?.id === currentPlayer?.id ? result.loser?.name || '' : result.gameWinner?.name || ''} 
                  color="text-blue-400" 
                />
              </div>
            </div>

            <div className="bg-game-bg rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold mb-3 text-purple-400">🎨 All Weapons in Battle 🎨</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {[...(result.winner?.weapons || []), ...(result.loser?.weapons || [])].map((weapon, index) => (
                  <motion.div
                    key={weapon.id || index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <WeaponImage imageUrl={weapon.imageUrl} name={weapon.name} size="w-10 h-10" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {weapon.name}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <Trophy className="w-16 h-16 mx-auto text-yellow-400" />
            </motion.div>

            <h2 className="text-3xl font-hero font-bold mb-4">
              {result.winner ? (
                <span className={isWinner ? 'text-green-400' : 'text-red-400'}>
                  {isWinner ? '🎯 Round Won!' : '💥 Round Lost!'}
                </span>
              ) : (
                <span className="text-yellow-400">🤝 Draw!</span>
              )}
            </h2>

            {result.winner && (
              <p className="text-xl text-gray-300 mb-4">
                {isWinner 
                  ? "You dominated this round!"
                  : `${result.winner.name} won this round!`
                }
              </p>
            )}

            {result.transferredWeapon && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-game-bg rounded-lg p-4 mb-6"
              >
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <Sword className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-blue-400">Weapon Transferred!</span>
                  <Sword className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex items-center justify-center space-x-4 mb-3">
                  <span className={isLoser ? 'text-red-400' : 'text-gray-400'}>
                    {result.loser?.name}
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <span className={isWinner ? 'text-green-400' : 'text-gray-400'}>
                    {result.winner?.name}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <WeaponImage imageUrl={result.transferredWeapon.imageUrl} name={result.transferredWeapon.name} />
                  <div className="text-lg font-bold text-yellow-400">
                    {result.transferredWeapon.name}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="bg-game-bg rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold mb-3">Current Round Wins</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="font-bold mb-2">{currentPlayer?.name}</div>
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {currentPlayer?.roundWins}
                  </div>
                  <div className="text-sm text-gray-400">Round Wins</div>
                </div>
                <div className="text-center">
                  <div className="font-bold mb-2">{result.winner?.id === currentPlayer?.id ? result.loser?.name : result.winner?.name}</div>
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {result.winner?.id === currentPlayer?.id ? result.loser?.roundWins : result.winner?.roundWins}
                  </div>
                  <div className="text-sm text-gray-400">Round Wins</div>
                </div>
              </div>
            </div>

            <div className="bg-game-bg rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold mb-3">Current Weapon Collections</h3>
              <div className="grid grid-cols-2 gap-6">
                <WeaponCollection 
                  weapons={currentPlayer?.weapons || []} 
                  playerName={currentPlayer?.name || ''} 
                  color="text-blue-400" 
                />
                <WeaponCollection 
                  weapons={result.winner?.id === currentPlayer?.id ? result.loser?.weapons || [] : result.winner?.weapons || []} 
                  playerName={result.winner?.id === currentPlayer?.id ? result.loser?.name || '' : result.winner?.name || ''} 
                  color="text-blue-400" 
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextRound}
              className="btn-primary text-lg px-8 py-4"
            >
              Next Round →
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default GameResultComponent; 