import React from 'react';
import { motion } from 'framer-motion';
import { Player, GameStateData } from '../types';
import { User, Sword, Trophy, Star } from 'lucide-react';

interface PlayerStatusProps {
  currentPlayer: Player | null;
  opponent: Player | null;
  isMyTurn: boolean;
  gameState: GameStateData;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({ 
  currentPlayer, 
  opponent, 
  isMyTurn, 
  gameState 
}) => {
  if (!currentPlayer || !opponent) return null;

  const WeaponImage: React.FC<{ imageUrl: string; name: string; size?: string }> = ({ imageUrl, name, size = 'w-8 h-8' }) => (
    <div className="relative">
      <img
        src={imageUrl}
        alt={name}
        className={`${size} object-contain rounded-md border border-game-border bg-game-bg p-1`}
        onError={(e) => {
          console.error('Failed to load weapon image:', imageUrl);
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
        <Star className="w-2 h-2 text-black" />
      </div>
    </div>
  );

  const WeaponCollection: React.FC<{ weapons: any[], label: string, color: string, playerSymbol: string }> = ({ weapons, label, color, playerSymbol }) => (
    <div className="bg-game-bg rounded-lg p-3 border border-game-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-xl">{playerSymbol}</div>
          <Trophy className={`w-4 h-4 ${color}`} />
          <span className="text-sm text-gray-400">{label}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`font-bold text-lg ${color}`}>
            {weapons.length}
          </span>
          <span className="text-gray-400">/5</span>
        </div>
      </div>
      
      {/* Weapon Collection Grid */}
      <div className="grid grid-cols-5 gap-2 min-h-[3rem]">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={`
              w-10 h-10 rounded-md border-2 border-dashed border-game-border
              flex items-center justify-center
              ${index < weapons.length ? 'border-solid border-yellow-400 bg-yellow-400/10' : ''}
            `}
          >
            {weapons[index] ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <WeaponImage imageUrl={weapons[index].imageUrl} name={weapons[index].name} size="w-8 h-8" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {weapons[index].name}
                </div>
              </motion.div>
            ) : (
              <div className="w-6 h-6 rounded border border-dashed border-gray-600 flex items-center justify-center">
                <span className="text-gray-600 text-xs">?</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              color === 'text-blue-400' ? 'bg-blue-400' : 'bg-red-400'
            }`}
            style={{ width: `${(weapons.length / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Current Player */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-game-card rounded-lg p-4 border-2 transition-all duration-200 ${
          isMyTurn ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-game-border'
        }`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-3xl">{currentPlayer.symbol}</div>
          <div className="flex-1">
            <h3 className="font-bold text-game-text text-lg">{currentPlayer.name}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-blue-400">You</p>
              {isMyTurn && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">YOUR TURN</span>}
            </div>
          </div>
        </div>

        {/* Round Wins Display */}
        <div className="bg-game-bg rounded-lg p-3 border border-game-border mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Round Wins</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-bold text-lg text-blue-400">
                {currentPlayer.roundWins}
              </span>
            </div>
          </div>
        </div>

        <WeaponCollection 
          weapons={currentPlayer.weapons} 
          label="Your Arsenal" 
          color="text-blue-400" 
          playerSymbol={currentPlayer.symbol}
        />

        {currentPlayer.selectedWeapon && (
          <div className="mt-3 bg-game-bg rounded-lg p-3 border border-blue-400/30">
            <div className="flex items-center space-x-2 mb-2">
              <Sword className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Battle Weapon</span>
            </div>
            <div className="flex items-center space-x-3">
              <WeaponImage imageUrl={currentPlayer.selectedWeapon.imageUrl} name={currentPlayer.selectedWeapon.name} size="w-10 h-10" />
              <div>
                <div className="font-medium text-game-text">
                  {currentPlayer.selectedWeapon.name}
                </div>
                <div className="text-xs text-gray-400">
                  Power: {currentPlayer.selectedWeapon.power}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Opponent */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className={`bg-game-card rounded-lg p-4 border-2 transition-all duration-200 ${
          !isMyTurn ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : 'border-game-border'
        }`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-3xl">{opponent.symbol}</div>
          <div className="flex-1">
            <h3 className="font-bold text-game-text text-lg">{opponent.name}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-red-400">Opponent</p>
              {!isMyTurn && <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full">THEIR TURN</span>}
            </div>
          </div>
        </div>

        {/* Round Wins Display */}
        <div className="bg-game-bg rounded-lg p-3 border border-game-border mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-400">Round Wins</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-bold text-lg text-red-400">
                {opponent.roundWins}
              </span>
            </div>
          </div>
        </div>

        <WeaponCollection 
          weapons={opponent.weapons} 
          label="Enemy Arsenal" 
          color="text-red-400" 
          playerSymbol={opponent.symbol}
        />

        {opponent.selectedWeapon && (
          <div className="mt-3 bg-game-bg rounded-lg p-3 border border-red-400/30">
            <div className="flex items-center space-x-2 mb-2">
              <Sword className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-400">Battle Weapon</span>
            </div>
            <div className="flex items-center space-x-3">
              <WeaponImage imageUrl={opponent.selectedWeapon.imageUrl} name={opponent.selectedWeapon.name} size="w-10 h-10" />
              <div>
                <div className="font-medium text-game-text">
                  {opponent.selectedWeapon.name}
                </div>
                <div className="text-xs text-gray-400">
                  Power: {opponent.selectedWeapon.power}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Game Progress */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-game-card rounded-lg p-4 border border-game-border"
      >
        <h3 className="font-bold text-game-text mb-3 flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span>Battle Status</span>
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Round</span>
            <span className="text-game-text font-medium">{gameState.roundNumber}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Turn</span>
            <span className={`font-medium ${isMyTurn ? 'text-green-400' : 'text-yellow-400'}`}>
              {isMyTurn ? 'Your turn' : 'Opponent\'s turn'}
            </span>
          </div>
          
          <div className="mt-3 pt-3 border-t border-game-border">
            <div className="text-xs text-gray-500 text-center">
              First to collect 5 weapons wins!
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PlayerStatus; 