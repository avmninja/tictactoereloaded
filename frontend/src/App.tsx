import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, WeaponType, GameStateData, GameResult, Player } from './types';
import GameModeSelection, { GameMode } from './components/GameModeSelection';
import PlayerSetup from './components/PlayerSetup';
import WeaponSelection from './components/WeaponSelection';
import GameBoard from './components/GameBoard';
import GameResultComponent from './components/GameResult';
import PlayerStatus from './components/PlayerStatus';
import ErrorBoundary from './components/ErrorBoundary';
import { LocalGameManager } from './utils/LocalGameManager';
import { Sword, Shield, Zap, Trophy, ArrowLeft } from 'lucide-react';
import config, { validateEnvironment } from './config/environment';
import './App.css';

function App() {
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);
  const [localGameManager, setLocalGameManager] = useState<LocalGameManager | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [availableUniverses, setAvailableUniverses] = useState<WeaponType[]>([WeaponType.MARVEL, WeaponType.DC]);
  
  // Local multiplayer state
  const [localPlayerStep, setLocalPlayerStep] = useState<1 | 2>(1);
  const [player1Data, setPlayer1Data] = useState<{name: string, type: WeaponType} | null>(null);

  // Initialize environment validation
  useEffect(() => {
    validateEnvironment();
  }, []);

  useEffect(() => {
    // Only initialize socket for online multiplayer mode
    if (selectedGameMode === GameMode.ONLINE_MULTIPLAYER) {
      if (config.enableConsoleLogs) {
        console.log('🔗 Attempting to connect to backend at:', config.backendUrl);
      }
      const newSocket = io(config.backendUrl, {
        timeout: config.socketTimeout,
        forceNew: true
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        if (config.enableConsoleLogs) {
          console.log('✅ Connected to server at:', config.backendUrl);
        }
        // Request available universes for this game
        newSocket.emit('get-available-universes');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        if (config.enableConsoleLogs) {
          console.log('❌ Disconnected from server');
        }
      });

      newSocket.on('connect_error', (error) => {
        setIsConnected(false);
        console.error('🚫 Connection error:', error.message);
        setError(`Connection failed to ${config.backendUrl}: ${error.message}`);
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

      newSocket.on('available-universes', (data) => {
        setAvailableUniverses(data.universes);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [selectedGameMode]);

  const handleGameModeSelection = (mode: GameMode) => {
    setSelectedGameMode(mode);
  };

  const resetToGameModeSelection = () => {
    setSelectedGameMode(null);
    setLocalGameManager(null);
    setGameState(null);
    setPlayerId('');
    setGameResult(null);
    setError('');
    setAvailableUniverses([WeaponType.MARVEL, WeaponType.DC]);
    setLocalPlayerStep(1);
    setPlayer1Data(null);
    if (socket) {
      socket.close();
      setSocket(null);
    }
    setIsConnected(false);
  };

  const joinGame = (name: string, type: WeaponType) => {
    if (selectedGameMode === GameMode.LOCAL_MULTIPLAYER) {
      if (localPlayerStep === 1) {
        // Store player 1 data and move to player 2 setup
        setPlayer1Data({ name, type });
        setLocalPlayerStep(2);
        return;
      } else {
        // Player 2 setup complete, create the game
        const gameMode = 'local_multiplayer';
        const manager = new LocalGameManager(
          gameMode,
          player1Data!.name,
          player1Data!.type,
          (gameState) => setGameState(gameState),
          (result) => setGameResult(result),
          'AI Opponent',
          name // Pass player 2 name
        );
        
        setLocalGameManager(manager);
        setPlayerId('player1');
        return;
      }
    }
    
    if (selectedGameMode === GameMode.ONLINE_MULTIPLAYER) {
      // Online multiplayer mode
      if (socket && isConnected) {
        socket.emit('join-game', { playerName: name, weaponType: type });
      }
    } else {
      // Single player mode
      const gameMode = 'single_player';
      const manager = new LocalGameManager(
        gameMode,
        name,
        type,
        (gameState) => setGameState(gameState),
        (result) => setGameResult(result)
      );
      
      setLocalGameManager(manager);
      setPlayerId('player1');
    }
  };

  const selectWeapon = (weaponId: string) => {
    if (selectedGameMode === GameMode.ONLINE_MULTIPLAYER) {
      // Online multiplayer mode
      if (socket && gameState) {
        socket.emit('select-weapon', { gameId: gameState.id, weaponId });
      }
    } else {
      // Local game modes
      if (localGameManager) {
        // For local modes, we can pass any ID since LocalGameManager will determine the correct player
        localGameManager.selectWeapon('current', weaponId);
      }
    }
  };

  const makeMove = (row: number, col: number) => {
    if (selectedGameMode === GameMode.ONLINE_MULTIPLAYER) {
      // Online multiplayer mode
      if (socket && gameState) {
        socket.emit('make-move', { gameId: gameState.id, row, col });
      }
    } else {
      // Local game modes
      if (localGameManager && gameState) {
        // For local multiplayer, determine the current player's ID
        const currentPlayerId = selectedGameMode === GameMode.LOCAL_MULTIPLAYER 
          ? (gameState.currentPlayer === 1 ? 'player1' : 'player2')
          : 'player1'; // For single player, always player1
        localGameManager.makeMove(currentPlayerId, row, col);
      }
    }
  };

  const nextRound = () => {
    if (selectedGameMode === GameMode.ONLINE_MULTIPLAYER) {
      // Online multiplayer mode
      if (socket && gameState) {
        socket.emit('next-round', { gameId: gameState.id });
        setGameResult(null);
      }
    } else {
      // Local game modes
      if (localGameManager) {
        localGameManager.nextRound();
        setGameResult(null);
      }
    }
  };

  const getCurrentPlayer = (): Player | null => {
    if (!gameState) return null;
    
    if (selectedGameMode === GameMode.LOCAL_MULTIPLAYER) {
      // For local multiplayer, return the player who should be selecting weapons
      if (gameState.state === GameState.WEAPON_SELECTION) {
        // Return the first player who hasn't selected a weapon yet
        const unreadyPlayer = gameState.players.find(p => !p.isReady);
        return unreadyPlayer || gameState.players[0];
      } else {
        // For gameplay, return the current player based on turn
        return gameState.players.find(p => gameState.players.indexOf(p) + 1 === gameState.currentPlayer) || gameState.players[0];
      }
    } else {
      // For single player and online multiplayer, use the playerId
      if (!playerId) return null;
      return gameState.players.find(p => p.id === playerId) || null;
    }
  };

  const getOpponentPlayer = (): Player | null => {
    if (!gameState || !playerId) return null;
    return gameState.players.find(p => p.id !== playerId) || null;
  };

  const isMyTurn = (): boolean => {
    if (!gameState) return false;
    
    if (selectedGameMode === GameMode.LOCAL_MULTIPLAYER) {
      // For local multiplayer, it's always "my turn" since both players are on the same device
      return true;
    } else if (selectedGameMode === GameMode.SINGLE_PLAYER) {
      // For single player, it's my turn when it's player 1's turn
      return gameState.currentPlayer === 1;
    } else {
      // For online multiplayer, check if it's the current player's turn
      if (!playerId) return false;
      const playerIndex = gameState.players.findIndex(p => p.id === playerId);
      return playerIndex + 1 === gameState.currentPlayer;
    }
  };

  const renderGameContent = () => {
    // Show game mode selection first
    if (!selectedGameMode) {
      return <GameModeSelection onSelectMode={handleGameModeSelection} />;
    }
    
    // Show player setup if no game state yet
    if (!gameState) {
      // For local multiplayer, show appropriate step
      if (selectedGameMode === GameMode.LOCAL_MULTIPLAYER) {
        if (localPlayerStep === 1) {
          return (
            <div className="min-h-screen bg-game-bg bg-game-pattern flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-game-card rounded-2xl p-8 border border-game-border shadow-2xl max-w-md w-full"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-hero font-bold text-game-text mb-2">Player 1 Setup</h2>
                  <p className="text-gray-400 text-sm">First player, enter your details</p>
                </div>
                <PlayerSetup 
                  onJoinGame={joinGame}
                  isConnected={true}
                  error={error}
                />
              </motion.div>
            </div>
          );
        } else {
          // Player 2 setup
          const player2Type = player1Data!.type === WeaponType.MARVEL ? WeaponType.DC : WeaponType.MARVEL;
          return (
            <div className="min-h-screen bg-game-bg bg-game-pattern flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-game-card rounded-2xl p-8 border border-game-border shadow-2xl max-w-md w-full"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-hero font-bold text-game-text mb-2">Player 2 Setup</h2>
                  <p className="text-gray-400 text-sm">
                    Second player, enter your hero name
                  </p>
                  <div className="mt-4 p-3 bg-game-bg rounded-lg border border-game-border">
                    <p className="text-sm text-gray-300">
                      <span className="text-blue-400 font-semibold">{player1Data!.name}</span> chose{' '}
                      <span className={player1Data!.type === WeaponType.MARVEL ? 'text-marvel-500' : 'text-dc-500'}>
                        {player1Data!.type.toUpperCase()}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      You will play as{' '}
                      <span className={player2Type === WeaponType.MARVEL ? 'text-marvel-500' : 'text-dc-500'}>
                        {player2Type.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
                <PlayerSetup 
                  onJoinGame={joinGame}
                  isConnected={true}
                  error={error}
                  availableUniverses={[player2Type]}
                />
              </motion.div>
            </div>
          );
        }
      } else {
        // Single player or online multiplayer
        return (
          <PlayerSetup 
            onJoinGame={joinGame}
            isConnected={selectedGameMode === GameMode.ONLINE_MULTIPLAYER ? isConnected : true}
            error={error}
            availableUniverses={selectedGameMode === GameMode.ONLINE_MULTIPLAYER ? availableUniverses : undefined}
          />
        );
      }
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetToGameModeSelection}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-game-card border border-game-border hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </motion.button>
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
              <div className={`w-3 h-3 rounded-full ${
                selectedGameMode === GameMode.ONLINE_MULTIPLAYER 
                  ? (isConnected ? 'bg-green-500' : 'bg-red-500')
                  : 'bg-blue-500'
              }`} />
              <div className="flex flex-col text-right">
                <span className="text-sm">
                  {selectedGameMode === GameMode.ONLINE_MULTIPLAYER 
                    ? (isConnected ? 'Connected' : 'Disconnected')
                    : selectedGameMode === GameMode.SINGLE_PLAYER 
                      ? 'Single Player' 
                      : 'Local Multiplayer'
                  }
                </span>
                <span className="text-xs text-gray-500">
                  {selectedGameMode === GameMode.ONLINE_MULTIPLAYER ? config.backendUrl : 'Local Mode'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Game Content */}
        <div className="max-w-6xl mx-auto p-6">
          <AnimatePresence mode="wait">
            {gameState.state === GameState.WAITING_FOR_PLAYERS && selectedGameMode === GameMode.ONLINE_MULTIPLAYER && (
              <motion.div 
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-400 animate-pulse" />
                <h2 className="text-2xl font-bold mb-2">Waiting for opponent...</h2>
                <p className="text-gray-400 mb-6">Share this link with a friend to start playing!</p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-game-card border border-game-border rounded-lg p-4 max-w-md mx-auto"
                >
                  <p className="text-sm text-gray-400 mb-2">Game Link:</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={window.location.href}
                      readOnly
                      className="flex-1 bg-game-bg border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-blue-500"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        // You could add a toast notification here
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      Copy
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ⚠️ Make sure both players use this frontend URL (port 3000), not the backend URL (port 3001)
                  </p>
                </motion.div>
              </motion.div>
            )}

            {gameState.state === GameState.WEAPON_SELECTION && (
              <motion.div
                key="weapon-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {selectedGameMode === GameMode.LOCAL_MULTIPLAYER ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Weapon Selection</h2>
                      <p className="text-gray-400 mb-3">Each player selects their weapon for this round</p>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm text-gray-300">Round {gameState.roundNumber}</span>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          gameState.roundNumber % 2 === 1 
                            ? 'bg-marvel-500/20 text-marvel-400 border border-marvel-500/30' 
                            : 'bg-dc-500/20 text-dc-400 border border-dc-500/30'
                        }`}>
                          {gameState.roundNumber % 2 === 1 ? '🦸‍♂️ Marvel starts first' : '🦸‍♀️ DC starts first'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {gameState.players.map((player, index) => (
                        <div key={player.id} className={`bg-game-card rounded-lg p-6 border ${
                          player.isReady ? 'border-green-500' : 'border-game-border'
                        }`}>
                          <div className="text-center mb-4">
                            <div className="text-3xl mb-2">{player.symbol}</div>
                            <h3 className="text-xl font-bold">{player.name}</h3>
                            <p className={`text-sm ${player.type === 'marvel' ? 'text-marvel-500' : 'text-dc-500'}`}>
                              {player.type.toUpperCase()} Universe
                            </p>
                            {player.isReady ? (
                              <div className="mt-2 flex items-center justify-center space-x-2 text-green-400">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm">Ready!</span>
                              </div>
                            ) : (
                              <div className="mt-2 flex items-center justify-center space-x-2 text-yellow-400">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <span className="text-sm">Selecting weapon...</span>
                              </div>
                            )}
                          </div>
                          
                          {!player.isReady && currentPlayer?.id === player.id && (
                            <WeaponSelection
                              gameState={gameState}
                              currentPlayer={player}
                              onSelectWeapon={selectWeapon}
                              simplified={true}
                            />
                          )}
                          
                          {player.selectedWeapon && (
                            <div className="text-center">
                              <img 
                                src={player.selectedWeapon.imageUrl} 
                                alt={player.selectedWeapon.name}
                                className="w-16 h-16 mx-auto mb-2"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              <p className="text-sm font-medium">{player.selectedWeapon.name}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <WeaponSelection
                    gameState={gameState}
                    currentPlayer={currentPlayer}
                    onSelectWeapon={selectWeapon}
                  />
                )}
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
                      <div className="flex items-center space-x-2">
                        <span>Round: {gameState.roundNumber}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          gameState.roundNumber % 2 === 1 
                            ? 'bg-marvel-500/20 text-marvel-400 border border-marvel-500/30' 
                            : 'bg-dc-500/20 text-dc-400 border border-dc-500/30'
                        }`}>
                          {gameState.roundNumber % 2 === 1 ? 'Marvel starts' : 'DC starts'}
                        </span>
                      </div>
                      <div>
                        {selectedGameMode === GameMode.LOCAL_MULTIPLAYER ? (
                          <div className="flex items-center space-x-2">
                            <span>Turn:</span>
                            <span className={`font-bold ${
                              gameState.currentPlayer === 1 ? 'text-marvel-500' : 'text-dc-500'
                            }`}>
                              {gameState.players[gameState.currentPlayer - 1]?.name || `Player ${gameState.currentPlayer}`}
                            </span>
                            <span className="text-2xl">
                              {gameState.players[gameState.currentPlayer - 1]?.symbol}
                            </span>
                          </div>
                        ) : (
                          <div>Turn: {isMyTurn() ? 'Your turn' : 'Opponent\'s turn'}</div>
                        )}
                      </div>
                      <div>Mode: {
                        selectedGameMode === GameMode.SINGLE_PLAYER ? 'vs AI' :
                        selectedGameMode === GameMode.LOCAL_MULTIPLAYER ? 'Local 2P' : 'Online'
                      }</div>
                    </div>
                    <div className="mt-4 p-3 bg-game-bg rounded border border-game-border">
                      <h4 className="font-bold text-yellow-400 mb-2">🏆 Victory Condition</h4>
                      <p className="text-xs text-gray-400 mb-2">
                        Win the most rounds after all weapons are exhausted!
                      </p>
                      <p className="text-xs text-gray-500">
                        ⚡ Marvel starts odd rounds, DC starts even rounds
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
                  gameState={gameState}
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
                    gameState={gameState}
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
                        onClick={() => {
                          if (selectedGameMode === GameMode.ONLINE_MULTIPLAYER) {
                            window.location.reload();
                          } else {
                            resetToGameModeSelection();
                          }
                        }}
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
    <ErrorBoundary>
      <div className="App">
        {renderGameContent()}
      </div>
    </ErrorBoundary>
  );
}

export default App; 