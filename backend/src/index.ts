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

// Routes
app.get('/', (req, res) => {
  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : `http://${req.get('host')?.replace(':3001', ':3000') || 'localhost:3000'}`;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tic-Tac-Toe Reloaded - Backend Server</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 600px; 
          margin: 50px auto; 
          padding: 20px; 
          background: #1a1a2e;
          color: #ffffff;
          text-align: center;
        }
        .container { 
          background: #16213e; 
          padding: 30px; 
          border-radius: 10px; 
          border: 1px solid #0f3460;
        }
        .logo { font-size: 2em; margin-bottom: 20px; }
        .button { 
          display: inline-block; 
          background: linear-gradient(45deg, #e53e3e, #3182ce); 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 10px;
          font-weight: bold;
          transition: transform 0.2s;
        }
        .button:hover { transform: scale(1.05); }
        .info { margin: 20px 0; color: #a0aec0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">⚔️ TIC-TAC-TOE RELOADED 🛡️</div>
        <h2>Backend Server is Running!</h2>
        <p class="info">This is the backend server. To play the game, visit the frontend:</p>
        <a href="${frontendUrl}" class="button">🎮 Play Game</a>
        <p class="info">
          <strong>For friends joining:</strong><br>
          Share this link: <a href="${frontendUrl}" style="color: #4299e1;">${frontendUrl}</a>
        </p>
        <div style="margin-top: 30px; font-size: 0.9em; color: #718096;">
          <p>🎯 3 Game Modes Available:</p>
          <p>• Play with Computer (AI)</p>
          <p>• 2 Player Same Screen</p>
          <p>• Play with Friend (Online)</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeGames: games.size,
    connectedPlayers: io.sockets.sockets.size
  });
});

// Game storage (in production, use Redis or database)
const games = new Map<string, Game>();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Get available universes for joining
  socket.on('get-available-universes', () => {
    // Find existing game with space
    let game = Array.from(games.values()).find(g => g.players.length < 2);
    
    if (!game || game.players.length === 0) {
      // No game or empty game - both universes available
      socket.emit('available-universes', { universes: [WeaponType.MARVEL, WeaponType.DC] });
    } else {
      // Game has one player - only opposite universe available
      const takenUniverse = game.players[0].type;
      const availableUniverse = takenUniverse === WeaponType.MARVEL ? WeaponType.DC : WeaponType.MARVEL;
      socket.emit('available-universes', { universes: [availableUniverse] });
    }
  });

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
    const result = game.addPlayer(socket.id, playerName, weaponType);
    
    if (result.success) {
      socket.join(game.id);
      socket.emit('game-joined', {
        gameId: game.id,
        playerId: socket.id,
        gameState: game.getState()
      });
      
      // Notify all players in the game
      io.to(game.id).emit('game-updated', game.getState());
    } else {
      socket.emit('error', { message: result.error || 'Failed to join game' });
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