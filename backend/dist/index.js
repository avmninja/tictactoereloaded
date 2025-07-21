"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const environment_1 = __importStar(require("./config/environment"));
const Game_1 = require("./models/Game");
// Validate environment on startup
(0, environment_1.validateEnvironment)();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Configure CORS for production
const corsOptions = {
    origin: environment_1.default.corsOrigin,
    credentials: true,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Security headers for production
if (environment_1.default.isProduction) {
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
    });
}
// Initialize Socket.IO with CORS configuration
const io = new socket_io_1.Server(server, {
    cors: environment_1.default.socketCors
});
// Game state management
const activeGames = new Map();
const playerGameMap = new Map();
// Cleanup inactive games periodically
setInterval(() => {
    const now = Date.now();
    for (const [gameId, game] of activeGames.entries()) {
        if (now - game.getLastActivity() > environment_1.default.gameTimeout) {
            if (environment_1.default.enableVerboseLogs) {
                console.log(`🧹 Cleaning up inactive game: ${gameId}`);
            }
            // Notify players about game cleanup
            io.to(gameId).emit('game-timeout', { message: 'Game timed out due to inactivity' });
            // Remove from maps
            activeGames.delete(gameId);
            for (const [playerId, mappedGameId] of playerGameMap.entries()) {
                if (mappedGameId === gameId) {
                    playerGameMap.delete(playerId);
                }
            }
        }
    }
}, environment_1.default.healthCheckInterval);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: environment_1.default.version,
        environment: environment_1.default.environment,
        activeGames: activeGames.size,
        connectedPlayers: io.sockets.sockets.size,
        uptime: process.uptime()
    });
});
// API info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        name: environment_1.default.appName,
        version: environment_1.default.version,
        environment: environment_1.default.environment,
        endpoints: {
            health: '/health',
            websocket: '/socket.io'
        }
    });
});
// Root endpoint with helpful information
app.get('/', (req, res) => {
    res.send(`
    <html>
      <head>
        <title>${environment_1.default.appName} - Backend</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .status { background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .emoji { font-size: 24px; }
          a { color: #4CAF50; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 ${environment_1.default.appName}</h1>
            <p>Backend API Server</p>
          </div>
          
          <div class="status">
            <h3>✅ Server Status</h3>
            <p><strong>Version:</strong> ${environment_1.default.version}</p>
            <p><strong>Environment:</strong> ${environment_1.default.environment}</p>
            <p><strong>Active Games:</strong> ${activeGames.size}</p>
            <p><strong>Connected Players:</strong> ${io.sockets.sockets.size}</p>
          </div>
          
          <div class="status">
            <h3>🔗 API Endpoints</h3>
            <p><a href="/health">Health Check</a> - Server health status</p>
            <p><a href="/api/info">API Info</a> - API information</p>
            <p><strong>WebSocket:</strong> /socket.io</p>
          </div>
          
          <div class="status">
            <h3>🎯 Frontend</h3>
            <p>Make sure your frontend is running and connected to this backend.</p>
            <p>Frontend should be available at: <a href="http://localhost:3000">http://localhost:3000</a></p>
          </div>
        </div>
      </body>
    </html>
  `);
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found',
        availableEndpoints: ['/health', '/api/info', '/']
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    if (environment_1.default.isProduction) {
        // Don't leak error details in production
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Something went wrong on our end'
        });
    }
    else {
        // Provide detailed errors in development
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message,
            stack: err.stack
        });
    }
});
// Socket.IO connection handling
io.on('connection', (socket) => {
    if (environment_1.default.enableVerboseLogs) {
        console.log(`🔌 Player connected: ${socket.id}`);
    }
    socket.on('get-available-universes', () => {
        // For now, both universes are always available in new games
        socket.emit('available-universes', {
            universes: ['marvel', 'dc']
        });
    });
    socket.on('join-game', ({ playerName, weaponType }) => {
        try {
            // Check if player is already in a game
            const existingGameId = playerGameMap.get(socket.id);
            if (existingGameId) {
                socket.emit('error', { message: 'You are already in a game' });
                return;
            }
            // Check if we've reached the maximum number of active games
            if (activeGames.size >= environment_1.default.maxActiveGames) {
                socket.emit('error', { message: 'Server is at capacity. Please try again later.' });
                return;
            }
            // Find an existing game looking for players or create a new one
            let targetGame = null;
            let gameId = '';
            // Look for existing games that need players
            for (const [id, game] of activeGames.entries()) {
                if (game.getPlayerCount() < environment_1.default.maxPlayersPerGame) {
                    targetGame = game;
                    gameId = id;
                    break;
                }
            }
            // Create new game if no suitable game found
            if (!targetGame) {
                gameId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                targetGame = new Game_1.Game(gameId);
                activeGames.set(gameId, targetGame);
                if (environment_1.default.enableVerboseLogs) {
                    console.log(`🎮 New game created: ${gameId}`);
                }
            }
            // Add player to game
            const result = targetGame.addPlayer(socket.id, playerName, weaponType);
            if (!result.success) {
                socket.emit('error', { message: result.error || 'Failed to join game' });
                return;
            }
            // Join socket room and update mappings
            socket.join(gameId);
            playerGameMap.set(socket.id, gameId);
            // Send game state to player
            socket.emit('game-joined', {
                playerId: socket.id,
                gameState: targetGame.getState()
            });
            // Notify all players in game about update
            io.to(gameId).emit('game-updated', targetGame.getState());
            if (environment_1.default.enableVerboseLogs) {
                console.log(`👤 Player ${playerName} (${socket.id}) joined game ${gameId}`);
            }
        }
        catch (error) {
            console.error('❌ Error in join-game:', error);
            socket.emit('error', { message: 'Failed to join game' });
        }
    });
    // Select weapon for round
    socket.on('select-weapon', (data) => {
        const { gameId, weaponId } = data;
        const game = activeGames.get(gameId);
        if (!game) {
            socket.emit('error', { message: 'Game not found' });
            return;
        }
        const success = game.selectWeapon(socket.id, weaponId);
        if (success) {
            io.to(gameId).emit('game-updated', game.getState());
        }
        else {
            socket.emit('error', { message: 'Failed to select weapon' });
        }
    });
    // Make move on board
    socket.on('make-move', (data) => {
        const { gameId, row, col } = data;
        const game = activeGames.get(gameId);
        if (!game) {
            socket.emit('error', { message: 'Game not found' });
            return;
        }
        const success = game.makeMove(socket.id, row, col);
        if (success) {
            io.to(gameId).emit('game-updated', game.getState());
            // Check if round ended
            if (game.state === Game_1.GameState.ROUND_END) {
                const result = game.getGameResult();
                io.to(gameId).emit('round-ended', result);
            }
        }
        else {
            socket.emit('error', { message: 'Invalid move' });
        }
    });
    // Start next round
    socket.on('next-round', (data) => {
        const { gameId } = data;
        const game = activeGames.get(gameId);
        if (!game) {
            socket.emit('error', { message: 'Game not found' });
            return;
        }
        game.nextRound();
        // Check if game is over after calling nextRound
        if (game.state === Game_1.GameState.GAME_OVER) {
            const result = game.getGameResult();
            io.to(gameId).emit('round-ended', result);
        }
        io.to(gameId).emit('game-updated', game.getState());
    });
    // Handle disconnect
    socket.on('disconnect', () => {
        if (environment_1.default.enableVerboseLogs) {
            console.log(`🔌 Player disconnected: ${socket.id}`);
        }
        // Remove player from games and clean up empty games
        const gameId = playerGameMap.get(socket.id);
        if (gameId) {
            const game = activeGames.get(gameId);
            if (game) {
                const playerIndex = game.players.findIndex(p => p.id === socket.id);
                if (playerIndex !== -1) {
                    game.players.splice(playerIndex, 1);
                    if (game.players.length === 0) {
                        activeGames.delete(gameId);
                        if (environment_1.default.enableVerboseLogs) {
                            console.log(`🧹 Cleaning up empty game: ${gameId}`);
                        }
                    }
                    else {
                        // Notify remaining players
                        io.to(gameId).emit('player-disconnected', { playerId: socket.id });
                        io.to(gameId).emit('game-updated', game.getState());
                    }
                }
            }
            playerGameMap.delete(socket.id);
        }
    });
});
// REST API Routes
app.get('/api/games', (req, res) => {
    const gamesList = Array.from(activeGames.values()).map(game => ({
        id: game.id,
        state: game.state,
        playerCount: game.players.length,
        roundNumber: game.roundNumber,
        createdAt: game.createdAt
    }));
    res.json(gamesList);
});
app.get('/api/games/:id', (req, res) => {
    const game = activeGames.get(req.params.id);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game.getState());
});
// Start server
server.listen(environment_1.default.port, environment_1.default.host, () => {
    console.log(`🚀 Server running on ${environment_1.default.host}:${environment_1.default.port}`);
    console.log(`🎮 Game server ready for epic battles!`);
    console.log(`🌍 Environment: ${environment_1.default.environment}`);
    console.log(`📊 Version: ${environment_1.default.version}`);
    // Show network IP for easy sharing
    if (environment_1.default.enableVerboseLogs || environment_1.default.isDevelopment) {
        const networkInterfaces = require('os').networkInterfaces();
        const networkIPs = Object.values(networkInterfaces)
            .flat()
            .filter((details) => details?.family === 'IPv4' && !details?.internal)
            .map((details) => details?.address);
        if (networkIPs.length > 0) {
            console.log(`📡 Accessible from network at http://${networkIPs[0]}:${environment_1.default.port}`);
        }
    }
    if (environment_1.default.isProduction) {
        console.log(`🔒 Production mode enabled - enhanced security and performance`);
    }
});
//# sourceMappingURL=index.js.map