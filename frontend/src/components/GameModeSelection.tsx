import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Users, Wifi, Zap, Trophy, Shield, AlertCircle } from 'lucide-react';
import config from '../config/environment';

export enum GameMode {
  SINGLE_PLAYER = 'single_player',
  LOCAL_MULTIPLAYER = 'local_multiplayer',
  ONLINE_MULTIPLAYER = 'online_multiplayer'
}

interface GameModeSelectionProps {
  onSelectMode: (mode: GameMode) => void;
}

const GameModeSelection: React.FC<GameModeSelectionProps> = ({ onSelectMode }) => {
  const gameModes = [
    {
      mode: GameMode.SINGLE_PLAYER,
      title: 'Play with Computer',
      description: 'Challenge the AI opponent',
      icon: Bot,
      color: 'from-purple-500 to-pink-500',
      features: ['AI Opponent', 'Multiple Difficulties', 'Solo Practice'],
      available: true
    },
    {
      mode: GameMode.LOCAL_MULTIPLAYER,
      title: '2 Player Same Screen',
      description: 'Play with a friend on the same device',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      features: ['Local Multiplayer', 'Same Device', 'Hot Seat Play'],
      available: true
    },
    {
      mode: GameMode.ONLINE_MULTIPLAYER,
      title: 'Play with Friend',
      description: config.staticMode 
        ? 'Requires backend server (not available in static mode)'
        : 'Online multiplayer with a friend',
      icon: Wifi,
      color: 'from-green-500 to-emerald-500',
      features: config.staticMode 
        ? ['Backend Required', 'Deploy Server', 'Real-time Play']
        : ['Online Multiplayer', 'Real-time Play', 'Cross-Device'],
      available: !config.staticMode
    }
  ];

  return (
    <div className="min-h-screen bg-game-bg text-game-text flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Shield className="w-12 h-12 text-marvel-500" />
            <h1 className="text-6xl font-hero font-bold bg-gradient-to-r from-marvel-500 to-dc-500 bg-clip-text text-transparent">
              TIC-TAC-TOE RELOADED
            </h1>
            <Zap className="w-12 h-12 text-dc-500" />
          </div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose your battle mode! Collect superhero weapons from Marvel and DC universes. 
            Win rounds to claim your opponent's weapons in this epic tic-tac-toe showdown!
          </p>
        </motion.div>

        {/* Game Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {gameModes.map((gameMode, index) => (
            <motion.div
              key={gameMode.mode}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="group"
            >
              <motion.div
                whileHover={gameMode.available ? { scale: 1.05, y: -5 } : {}}
                whileTap={gameMode.available ? { scale: 0.95 } : {}}
                onClick={() => gameMode.available && onSelectMode(gameMode.mode)}
                className={`bg-game-card border rounded-2xl p-8 transition-all duration-300 relative overflow-hidden ${
                  gameMode.available 
                    ? 'border-game-border cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20' 
                    : 'border-gray-600 cursor-not-allowed opacity-60'
                }`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gameMode.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${!gameMode.available && 'opacity-5'}`} />
                
                {/* Disabled Overlay */}
                {!gameMode.available && (
                  <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-20">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                      <span className="text-sm text-yellow-300 font-medium">Not Available</span>
                      {config.isGitHubPages && (
                        <p className="text-xs text-gray-400 mt-1">Deploy backend to enable</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${gameMode.color} shadow-lg ${!gameMode.available && 'grayscale'}`}>
                      <gameMode.icon className="w-12 h-12 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-center mb-4 text-white">
                    {gameMode.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-center mb-6">
                    {gameMode.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3">
                    {gameMode.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gameMode.color}`} />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Play Button */}
                  <motion.button
                    whileHover={gameMode.available ? { scale: 1.05 } : {}}
                    whileTap={gameMode.available ? { scale: 0.95 } : {}}
                    disabled={!gameMode.available}
                    className={`w-full mt-8 py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                      gameMode.available 
                        ? `bg-gradient-to-r ${gameMode.color} text-white hover:shadow-xl`
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {gameMode.available ? 'Play Now' : 'Not Available'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span className="text-gray-400">Victory Condition: Win the most rounds after all weapons are exhausted!</span>
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Choose your universe (Marvel or DC) and collect powerful weapons to dominate the battlefield!
          </p>
          
          {/* GitHub Pages Notice */}
          {config.isGitHubPages && config.staticMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="max-w-2xl mx-auto bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
            >
              <div className="flex items-center justify-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 font-medium">GitHub Pages Mode</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                You're running in static mode. Online multiplayer requires a backend server.
              </p>
              <p className="text-xs text-gray-400">
                To enable online multiplayer, deploy the backend to Heroku, Railway, or any Node.js hosting service.
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameModeSelection; 