import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WeaponType } from '../types';
import { User, Sword, Shield, Zap } from 'lucide-react';

interface PlayerSetupProps {
  onJoinGame: (name: string, type: WeaponType) => void;
  isConnected: boolean;
  error: string;
  availableUniverses?: WeaponType[]; // For restricting universe selection
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onJoinGame, isConnected, error, availableUniverses }) => {
  const [playerName, setPlayerName] = useState('');
  const [selectedType, setSelectedType] = useState<WeaponType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If availableUniverses is provided, use it; otherwise allow both
  const allowedUniverses = availableUniverses || [WeaponType.MARVEL, WeaponType.DC];
  const isMarvelAllowed = allowedUniverses.includes(WeaponType.MARVEL);
  const isDCAllowed = allowedUniverses.includes(WeaponType.DC);

  // Auto-select if only one universe is available
  React.useEffect(() => {
    if (allowedUniverses.length === 1 && !selectedType) {
      setSelectedType(allowedUniverses[0]);
    }
  }, [allowedUniverses, selectedType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim() || !selectedType || !isConnected) {
      return;
    }

    setIsSubmitting(true);
    onJoinGame(playerName.trim(), selectedType);
    
    // Reset submitting state after a delay
    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-game-bg bg-game-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-game-card rounded-2xl p-8 border border-game-border shadow-2xl max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <Sword className="w-8 h-8 text-marvel-500" />
            <h1 className="text-3xl font-hero font-bold bg-gradient-to-r from-marvel-500 to-dc-500 bg-clip-text text-transparent">
              EPIC BATTLE
            </h1>
            <Shield className="w-8 h-8 text-dc-500" />
          </motion.div>
          <p className="text-gray-400 text-sm">
            Choose your hero and enter the battlefield!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player Name Input */}
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-game-text mb-2">
              Hero Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-game-bg border border-game-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-game-text placeholder-gray-400"
                placeholder="Enter your hero name"
                maxLength={20}
                required
              />
            </div>
          </div>

          {/* Universe Selection */}
          <div>
            <label className="block text-sm font-medium text-game-text mb-2">
              Choose Your Universe
            </label>
            {allowedUniverses.length === 1 && (
              <p className="text-xs text-yellow-400 mb-3">
                ⚡ The other universe is already taken by another player
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              {/* Marvel Option */}
              <motion.div
                whileHover={isMarvelAllowed ? { scale: 1.02 } : {}}
                whileTap={isMarvelAllowed ? { scale: 0.98 } : {}}
                onClick={() => isMarvelAllowed && setSelectedType(WeaponType.MARVEL)}
                className={`
                  ${isMarvelAllowed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} 
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${selectedType === WeaponType.MARVEL 
                    ? 'border-marvel-500 bg-marvel-500/10 shadow-lg' 
                    : isMarvelAllowed 
                      ? 'border-game-border hover:border-marvel-500/50 bg-game-bg'
                      : 'border-gray-600 bg-gray-800'
                  }
                `}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🦸‍♂️</div>
                  <div className={`font-bold ${isMarvelAllowed ? 'text-marvel-500' : 'text-gray-500'}`}>MARVEL</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {isMarvelAllowed ? 'Heroes of Earth' : 'Already taken'}
                  </div>
                </div>
              </motion.div>

              {/* DC Option */}
              <motion.div
                whileHover={isDCAllowed ? { scale: 1.02 } : {}}
                whileTap={isDCAllowed ? { scale: 0.98 } : {}}
                onClick={() => isDCAllowed && setSelectedType(WeaponType.DC)}
                className={`
                  ${isDCAllowed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} 
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${selectedType === WeaponType.DC 
                    ? 'border-dc-500 bg-dc-500/10 shadow-lg' 
                    : isDCAllowed 
                      ? 'border-game-border hover:border-dc-500/50 bg-game-bg'
                      : 'border-gray-600 bg-gray-800'
                  }
                `}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🦸‍♀️</div>
                  <div className={`font-bold ${isDCAllowed ? 'text-dc-500' : 'text-gray-500'}`}>DC</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {isDCAllowed ? 'Legends of Justice' : 'Already taken'}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'Connected to server' : 'Connecting...'}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!playerName.trim() || !selectedType || !isConnected || isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full py-4 rounded-lg font-bold text-white transition-all duration-200
              ${(!playerName.trim() || !selectedType || !isConnected || isSubmitting)
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-marvel-500 to-dc-500 hover:from-marvel-600 hover:to-dc-600 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="loading-spinner w-5 h-5" />
                <span>Joining Battle...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Enter the Arena!</span>
              </div>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>• Select your universe and weapon each round</p>
          <p>• Winner takes opponent's weapon</p>
          <p>• Win the most rounds after all weapons are exhausted!</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PlayerSetup; 