import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameStateData, Player, WeaponType } from '../types';
import { ChevronDown, Sword, Shield, Zap, Star } from 'lucide-react';

interface WeaponSelectionProps {
  gameState: GameStateData;
  currentPlayer: Player | null;
  onSelectWeapon: (weaponId: string) => void;
}

const WEAPONS = {
  [WeaponType.MARVEL]: [
    { id: 'mjolnir', name: 'Mjolnir', power: 95, rarity: 'legendary', description: "Thor's hammer", imageUrl: 'https://img.icons8.com/color/96/thor-hammer.png' },
    { id: 'shield', name: "Captain America's Shield", power: 85, rarity: 'epic', description: 'Vibranium shield', imageUrl: 'https://img.icons8.com/color/96/captain-america.png' },
    { id: 'repulsors', name: "Iron Man Repulsors", power: 88, rarity: 'epic', description: 'Arc reactor beams', imageUrl: 'https://img.icons8.com/color/96/iron-man.png' },
    { id: 'claws', name: "Adamantium Claws", power: 80, rarity: 'rare', description: 'Wolverine claws', imageUrl: 'https://img.icons8.com/color/96/wolverine.png' },
    { id: 'agamotto', name: 'Eye of Agamotto', power: 92, rarity: 'legendary', description: 'Time artifact', imageUrl: 'https://img.icons8.com/color/96/magic-portal.png' },
  ],
  [WeaponType.DC]: [
    { id: 'lasso', name: 'Lasso of Truth', power: 90, rarity: 'legendary', description: "Wonder Woman's lasso", imageUrl: 'https://img.icons8.com/color/96/wonder-woman.png' },
    { id: 'batarangs', name: 'Batarangs', power: 75, rarity: 'rare', description: "Batman's weapons", imageUrl: 'https://img.icons8.com/color/96/batman.png' },
    { id: 'ring', name: 'Green Lantern Ring', power: 94, rarity: 'legendary', description: "Green Lantern's ring", imageUrl: 'https://img.icons8.com/color/96/green-lantern.png' },
    { id: 'trident', name: "Aquaman's Trident", power: 87, rarity: 'epic', description: "Aquaman's trident", imageUrl: 'https://img.icons8.com/color/96/aquaman.png' },
    { id: 'heat_vision', name: 'Heat Vision', power: 89, rarity: 'epic', description: "Superman's vision", imageUrl: 'https://img.icons8.com/color/96/superman.png' },
  ],
};

const WeaponSelection: React.FC<WeaponSelectionProps> = ({ gameState, currentPlayer, onSelectWeapon }) => {
  const [selectedWeapon, setSelectedWeapon] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!currentPlayer) return null;

  const availableWeapons = WEAPONS[currentPlayer.type];
  const opponent = gameState.players.find(p => p.id !== currentPlayer.id);

  const handleWeaponSelect = (weaponId: string) => {
    setSelectedWeapon(weaponId);
    setIsDropdownOpen(false);
    onSelectWeapon(weaponId);
  };

  const selectedWeaponData = availableWeapons.find(w => w.id === selectedWeapon);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const WeaponImage: React.FC<{ imageUrl: string; name: string; size?: string }> = ({ imageUrl, name, size = 'w-8 h-8' }) => (
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
  );

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-hero font-bold text-glow mb-2">
          Choose Your Weapon
        </h2>
        <p className="text-gray-400">
          Round {gameState.roundNumber} - Select your weapon for this battle
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Player */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-game-card rounded-xl p-6 border border-game-border"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="text-2xl">{currentPlayer.symbol}</div>
            <div>
              <h3 className="text-xl font-bold text-game-text">{currentPlayer.name}</h3>
              <p className={`text-sm ${currentPlayer.type === WeaponType.MARVEL ? 'text-marvel-500' : 'text-dc-500'}`}>
                {currentPlayer.type.toUpperCase()} Universe
              </p>
            </div>
          </div>

          {/* Weapon Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-4 bg-game-bg border border-game-border rounded-lg flex items-center justify-between hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {selectedWeaponData ? (
                  <>
                    <WeaponImage imageUrl={selectedWeaponData.imageUrl} name={selectedWeaponData.name} />
                    <span className="text-game-text">{selectedWeaponData.name}</span>
                  </>
                ) : (
                  <>
                    <Sword className="w-5 h-5 text-gray-400" />
                    <span className="text-game-text">Select a weapon...</span>
                  </>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 w-full bg-game-card border border-game-border rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto"
              >
                {availableWeapons.map((weapon) => (
                  <button
                    key={weapon.id}
                    onClick={() => handleWeaponSelect(weapon.id)}
                    className="w-full p-4 hover:bg-game-bg transition-colors border-b border-game-border last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <WeaponImage imageUrl={weapon.imageUrl} name={weapon.name} />
                        <div className="text-left">
                          <div className="font-medium text-game-text">{weapon.name}</div>
                          <div className="text-sm text-gray-400">{weapon.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-xs border ${getRarityColor(weapon.rarity)}`}>
                          {weapon.rarity}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-bold">{weapon.power}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Selected Weapon Display */}
          {selectedWeaponData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 bg-game-bg rounded-lg border border-game-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <WeaponImage imageUrl={selectedWeaponData.imageUrl} name={selectedWeaponData.name} />
                  <h4 className="font-bold text-game-text">{selectedWeaponData.name}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded text-xs border ${getRarityColor(selectedWeaponData.rarity)}`}>
                    {selectedWeaponData.rarity}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold">{selectedWeaponData.power}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-400">{selectedWeaponData.description}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Opponent */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-game-card rounded-xl p-6 border border-game-border"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="text-2xl">{opponent?.symbol}</div>
            <div>
              <h3 className="text-xl font-bold text-game-text">{opponent?.name}</h3>
              <p className={`text-sm ${opponent?.type === WeaponType.MARVEL ? 'text-marvel-500' : 'text-dc-500'}`}>
                {opponent?.type.toUpperCase()} Universe
              </p>
            </div>
          </div>

          <div className="text-center py-8">
            {opponent?.isReady ? (
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-6 h-6 text-green-400" />
                <span className="text-green-400 font-medium">Weapon Selected</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400">Choosing weapon...</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Ready Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-center"
      >
        {currentPlayer.isReady && opponent?.isReady ? (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Battle starting...</span>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">
            Waiting for both players to select their weapons...
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WeaponSelection; 