import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Game, GameState } from './models/Game';
import { WeaponType } from './models/Weapon';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.86.190:3000", /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://192.168.86.190:3000", /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/],
  credentials: true
}));
app.use(express.json());

// Game storage (in production, use Redis or database)
const games = new Map<string, Game>();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Join or create game
  socket.on('join-game', (data: { playerName: string, weaponType: WeaponType }) => {
    const { playerName, weaponType } = data;
    
    // Find existing game or create new one
    let game = Array.from(games.values()).find(g => g.players.length < 2);
    
    if (!game) {
      const gameId = uuidv4();
      game = new Game(gameId);
      games.set(gameId, game);
    }

    // Add player to game
    const success = game.addPlayer(socket.id, playerName, weaponType);
    
    if (success) {
      socket.join(game.id);
      socket.emit('game-joined', {
        gameId: game.id,
        playerId: socket.id,
        gameState: game.getState()
      });
      
      // Notify all players in the game
      io.to(game.id).emit('game-updated', game.getState());
    } else {
      socket.emit('error', { message: 'Failed to join game' });
    }
  });

  // Select weapon for round
  socket.on('select-weapon', (data: { gameId: string, weaponId: string }) => {
    const { gameId, weaponId } = data;
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const success = game.selectWeapon(socket.id, weaponId);
    
    if (success) {
      io.to(gameId).emit('game-updated', game.getState());
    } else {
      socket.emit('error', { message: 'Failed to select weapon' });
    }
  });

  // Make move on board
  socket.on('make-move', (data: { gameId: string, row: number, col: number }) => {
    const { gameId, row, col } = data;
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const success = game.makeMove(socket.id, row, col);
    
    if (success) {
      io.to(gameId).emit('game-updated', game.getState());
      
      // Check if round ended
      if (game.state === GameState.ROUND_END) {
        const result = game.getGameResult();
        io.to(gameId).emit('round-ended', result);
      }
    } else {
      socket.emit('error', { message: 'Invalid move' });
    }
  });

  // Start next round
  socket.on('next-round', (data: { gameId: string }) => {
    const { gameId } = data;
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    game.nextRound();
    
    // Check if game is over after calling nextRound
    if (game.state === GameState.GAME_OVER) {
      const result = game.getGameResult();
      io.to(gameId).emit('round-ended', result);
    }
    
    io.to(gameId).emit('game-updated', game.getState());
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Remove player from games and clean up empty games
    games.forEach((game, gameId) => {
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);
        
        if (game.players.length === 0) {
          games.delete(gameId);
        } else {
          // Notify remaining players
          io.to(gameId).emit('player-disconnected', { playerId: socket.id });
          io.to(gameId).emit('game-updated', game.getState());
        }
      }
    });
  });
});

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeGames: games.size
  });
});

app.get('/api/games', (req, res) => {
  const gamesList = Array.from(games.values()).map(game => ({
    id: game.id,
    state: game.state,
    playerCount: game.players.length,
    roundNumber: game.roundNumber,
    createdAt: game.createdAt
  }));
  
  res.json(gamesList);
});

app.get('/api/games/:id', (req, res) => {
  const game = games.get(req.params.id);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  res.json(game.getState());
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`🎮 Game server ready for epic battles!`);
  console.log(`📡 Accessible from network at http://192.168.86.190:${PORT}`);
}); 