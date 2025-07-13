import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, WeaponType, GameStateData, GameResult, Player } from './types';
import PlayerSetup from './components/PlayerSetup';
import WeaponSelection from './components/WeaponSelection';
import GameBoard from './components/GameBoard';
import GameResultComponent from './components/GameResult';
import PlayerStatus from './components/PlayerStatus';
import { Sword, Shield, Zap, Trophy } from 'lucide-react';
import './App.css';

// Automatically detect the correct backend URL
const getBackendUrl = () => {
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // Use the same host as the frontend but port 3001
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3001`;
};

const BACKEND_URL = getBackendUrl();

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerType, setPlayerType] = useState<WeaponType | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('🔗 Attempting to connect to backend at:', BACKEND_URL);
    const newSocket = io(BACKEND_URL, {
      timeout: 10000,
      forceNew: true
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Connected to server at:', BACKEND_URL);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Disconnected from server');
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
      console.error('🚫 Connection error:', error.message);
      setError(`Connection failed to ${BACKEND_URL}: ${error.message}`);
    });

    newSocket.on('game-joined', (data) => {
      setPlayerId(data.playerId);
      setGameState(data.gameState);
      setError('');
    });

    newSocket.on('game-updated', (updatedGameState) => {
      setGameState(updatedGameState);
    });

    newSocket.on('round-ended', (result) => {
      setGameResult(result);
    });

    newSocket.on('player-disconnected', (data) => {
      setError('Other player disconnected');
    });

    newSocket.on('error', (data) => {
      setError(data.message);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinGame = (name: string, type: WeaponType) => {
    if (socket && isConnected) {
      setPlayerName(name);
      setPlayerType(type);
      socket.emit('join-game', { playerName: name, weaponType: type });
    }
  };

  const selectWeapon = (weaponId: string) => {
    if (socket && gameState) {
      socket.emit('select-weapon', { gameId: gameState.id, weaponId });
    }
  };

  const makeMove = (row: number, col: number) => {
    if (socket && gameState) {
      socket.emit('make-move', { gameId: gameState.id, row, col });
    }
  };

  const nextRound = () => {
    if (socket && gameState) {
      socket.emit('next-round', { gameId: gameState.id });
      setGameResult(null);
    }
  };

  const getCurrentPlayer = (): Player | null => {
    if (!gameState || !playerId) return null;
    return gameState.players.find(p => p.id === playerId) || null;
  };

  const getOpponentPlayer = (): Player | null => {
    if (!gameState || !playerId) return null;
    return gameState.players.find(p => p.id !== playerId) || null;
  };

  const isMyTurn = (): boolean => {
    if (!gameState || !playerId) return false;
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    return playerIndex + 1 === gameState.currentPlayer;
  };

  const renderGameContent = () => {
    if (!gameState) {
      return (
        <PlayerSetup 
          onJoinGame={joinGame}
          isConnected={isConnected}
          error={error}
        />
      );
    }

    const currentPlayer = getCurrentPlayer();
    const opponent = getOpponentPlayer();

    return (
      <div className="min-h-screen bg-game-bg text-game-text">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-game-card border-b border-game-border p-4"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sword className="w-8 h-8 text-marvel-500" />
                <h1 className="text-3xl font-hero font-bold bg-gradient-to-r from-marvel-500 to-dc-500 bg-clip-text text-transparent">
                  TIC-TAC-TOE
                </h1>
                <Shield className="w-8 h-8 text-dc-500" />
              </div>
              <div className="text-sm text-gray-400">
                Round {gameState.roundNumber} • {gameState.players.length}/2 Players
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="flex flex-col text-right">
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
                <span className="text-xs text-gray-500">{BACKEND_URL}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Game Content */}
        <div className="max-w-6xl mx-auto p-6">
          <AnimatePresence mode="wait">
            {gameState.state === GameState.WAITING_FOR_PLAYERS && (
              <motion.div 
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-400 animate-pulse" />
                <h2 className="text-2xl font-bold mb-2">Waiting for opponent...</h2>
                <p className="text-gray-400">Share the game link with a friend to start!</p>
              </motion.div>
            )}

            {gameState.state === GameState.WEAPON_SELECTION && (
              <motion.div
                key="weapon-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <WeaponSelection
                  gameState={gameState}
                  currentPlayer={currentPlayer}
                  onSelectWeapon={selectWeapon}
                />
              </motion.div>
            )}

            {gameState.state === GameState.PLAYING && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                {/* Player Status */}
                <div className="lg:col-span-1">
                  <PlayerStatus
                    currentPlayer={currentPlayer}
                    opponent={opponent}
                    isMyTurn={isMyTurn()}
                    gameState={gameState}
                  />
                </div>

                {/* Game Board */}
                <div className="lg:col-span-2">
                  <GameBoard
                    gameState={gameState}
                    onMove={makeMove}
                    isMyTurn={isMyTurn()}
                    playerId={playerId}
                  />
                </div>

                {/* Game Info */}
                <div className="lg:col-span-1">
                  <div className="bg-game-card rounded-lg p-4 border border-game-border">
                    <h3 className="font-bold text-lg mb-4">Game Info</h3>
                    <div className="space-y-2 text-sm">
                      <div>Round: {gameState.roundNumber}</div>
                      <div>Turn: {isMyTurn() ? 'Your turn' : 'Opponent\'s turn'}</div>
                      <div>State: {gameState.state}</div>
                    </div>
                    <div className="mt-4 p-3 bg-game-bg rounded border border-game-border">
                      <h4 className="font-bold text-yellow-400 mb-2">🏆 Victory Condition</h4>
                      <p className="text-xs text-gray-400">
                        Win the most rounds after all weapons are exhausted!
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {gameState.state === GameState.ROUND_END && gameResult && (
              <motion.div
                key="round-end"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <GameResultComponent
                  result={gameResult}
                  currentPlayer={currentPlayer}
                  onNextRound={nextRound}
                />
              </motion.div>
            )}

            {gameState.state === GameState.GAME_OVER && (
              <motion.div
                key="game-over"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {gameResult ? (
                  <GameResultComponent
                    result={gameResult}
                    currentPlayer={currentPlayer}
                    onNextRound={nextRound}
                    isGameOver={true}
                  />
                ) : (
                  // Fallback game over screen when gameResult is not available
                  <div className="max-w-2xl mx-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-game-card rounded-2xl p-8 border border-game-border shadow-2xl text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="mb-6"
                      >
                        <Trophy className="w-20 h-20 mx-auto text-yellow-400" />
                      </motion.div>

                      <h2 className="text-4xl font-hero font-bold text-yellow-400 mb-4">
                        🎉 GAME OVER! 🎉
                      </h2>

                      <p className="text-xl text-gray-300 mb-6">
                        All weapons have been exhausted! The battle ended based on round wins.
                      </p>

                      <div className="bg-game-bg rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-bold mb-4 text-yellow-400">🏆 Final Round Wins 🏆</h3>
                        <div className="grid grid-cols-2 gap-6">
                          {gameState.players.map((player, index) => (
                            <div key={player.id} className="text-center">
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                <div className="text-2xl">{player.symbol}</div>
                                <div className="font-bold">{player.name}</div>
                              </div>
                              <div className={`text-4xl font-bold mb-2 ${player.id === currentPlayer?.id ? 'text-green-400' : 'text-red-400'}`}>
                                {player.roundWins}
                              </div>
                              <div className="text-sm text-gray-400">Round Wins</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-game-bg rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-bold mb-4 text-purple-400">⚔️ Final Weapon Collections ⚔️</h3>
                        <div className="grid grid-cols-2 gap-6">
                          {gameState.players.map((player, index) => (
                            <div key={player.id} className="text-center">
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                <div className="text-2xl">{player.symbol}</div>
                                <div className="font-bold">{player.name}</div>
                              </div>
                              <div className={`text-2xl font-bold mb-2 ${player.id === currentPlayer?.id ? 'text-blue-400' : 'text-blue-400'}`}>
                                {player.weapons.length}/5 weapons
                              </div>
                              {player.weapons.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-1">
                                  {player.weapons.map((weapon, weaponIndex) => (
                                    <motion.div
                                      key={weapon.id || weaponIndex}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: weaponIndex * 0.1 }}
                                      className="relative group"
                                    >
                                      <img
                                        src={weapon.imageUrl}
                                        alt={weapon.name}
                                        className="w-8 h-8 object-contain rounded-md border border-game-border"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                        }}
                                      />
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {weapon.name}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-game-bg rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-bold mb-3 text-purple-400">🎨 All Weapons in Battle 🎨</h3>
                        <div className="flex flex-wrap justify-center gap-2">
                          {gameState.players.flatMap(player => player.weapons).map((weapon, index) => (
                            <motion.div
                              key={weapon.id || index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="relative group"
                            >
                              <img
                                src={weapon.imageUrl}
                                alt={weapon.name}
                                className="w-10 h-10 object-contain rounded-md border border-game-border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {weapon.name}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.reload()}
                        className="btn-primary text-lg px-8 py-4"
                      >
                        Play Again
                      </motion.button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="App">
      {renderGameContent()}
    </div>
  );
}

export default App; 