# 🎮 Tic-Tac-Toe Weapon Collection Game

## Marvel vs DC - Epic Battle for All Weapons! 🦸‍♂️🦸‍♀️

A modern, real-time multiplayer twist on the classic tic-tac-toe game where heroes battle not just for board control, but for the ultimate weapon collection! Built with **React**, **TypeScript**, **Node.js**, and **Socket.IO**.

## 🎯 Game Overview

This isn't your ordinary tic-tac-toe! In this epic battle:

- **Player 1** commands Marvel weapons 🦸‍♂️
- **Player 2** wields DC weapons 🦸‍♀️  
- **Each round, select ONE weapon** from a dropdown menu
- Winners steal opponent's selected weapon
- **First to collect 5 weapons wins the entire game!**

## 🗡️ Weapon Arsenal

### Marvel Weapons 🔴
- **Mjolnir** ⚡ - Thor's enchanted hammer (Power: 95, Legendary)
- **Captain America's Shield** 🛡️ - Indestructible vibranium shield (Power: 85, Epic)
- **Iron Man's Repulsors** 🔥 - Arc reactor energy beams (Power: 88, Epic)
- **Adamantium Claws** ⚔️ - Wolverine's unbreakable claws (Power: 80, Rare)
- **Eye of Agamotto** 👁️ - Dr. Strange's time-manipulating artifact (Power: 92, Legendary)

### DC Weapons 🔵
- **Lasso of Truth** 🪢 - Wonder Woman's golden lasso (Power: 90, Legendary)
- **Batarangs** 🦇 - Batman's precision throwing weapons (Power: 75, Rare)
- **Green Lantern Ring** 💍 - Willpower-powered cosmic ring (Power: 94, Legendary)
- **Aquaman's Trident** 🔱 - Trident of Atlan from the seven seas (Power: 87, Epic)
- **Heat Vision** 👁️‍🗨️ - Superman's concentrated laser vision (Power: 89, Epic)

## 🎲 How to Play

### Setup Phase
1. **Enter your hero name** and **choose your universe** (Marvel or DC)
2. **Join the battle** - automatically matched with another player
3. **Wait for opponent** to join

### Battle Phase
1. **Select weapon** - Choose ONE weapon from your universe's dropdown menu
2. **Take turns** - Click on empty board cells to make your move
3. **Win rounds** - Get 3 in a row (horizontal, vertical, or diagonal)
4. **Collect weapons** - Round winners steal opponent's selected weapon
5. **Achieve victory** - First player to collect 5 weapons wins!

### Victory Conditions
- **Round Victory**: 3 in a row on the tic-tac-toe board
- **Game Victory**: Collect 5 weapons total (your universe + opponent's)

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** 18+ and **npm**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd tictactoereloaded

# Install all dependencies (root, backend, frontend)
npm run install:all

# Start both backend and frontend in development mode
npm run dev
```

### Manual Setup (Alternative)
```bash
# Install root dependencies
npm install

# Setup backend
cd backend
npm install
npm run dev

# In a new terminal, setup frontend
cd frontend
npm install
npm start
```

### Production Build
```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

## 🎨 Features

### 🎯 Modern UI/UX
- **React + TypeScript** - Type-safe, component-based architecture
- **Tailwind CSS** - Modern, responsive styling with dark theme
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, consistent icons

### 🌐 Real-Time Multiplayer
- **Socket.IO** - Instant real-time communication
- **Auto-matchmaking** - Automatic player pairing
- **Live updates** - See opponent actions instantly
- **Disconnect handling** - Graceful connection management

### ⚔️ Enhanced Gameplay
- **Weapon dropdown selection** - Choose your weapon each round
- **Rarity system** - Legendary, Epic, Rare weapon classifications
- **Power levels** - Strategic weapon choice matters
- **Dynamic weapon transfer** - Win weapons from opponents
- **Victory animations** - Celebrate your triumphs!

### 📱 Responsive Design
- **Mobile-friendly** - Optimized for all screen sizes
- **Touch support** - Perfect for tablets and phones
- **Progressive Web App** - Install on any device

## 🏗️ Modern Architecture

### Backend (Node.js + TypeScript)
```
backend/
├── src/
│   ├── models/
│   │   ├── Game.ts          # Game logic and state management
│   │   └── Weapon.ts        # Weapon definitions and system
│   └── index.ts             # Express server with Socket.IO
├── package.json
└── tsconfig.json
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/
│   │   ├── PlayerSetup.tsx      # Player configuration
│   │   ├── WeaponSelection.tsx  # Weapon dropdown interface
│   │   ├── GameBoard.tsx        # Interactive tic-tac-toe board
│   │   ├── GameResult.tsx       # Round/game result display
│   │   └── PlayerStatus.tsx     # Player info and progress
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   └── index.tsx               # React entry point
├── public/
│   └── index.html
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## 🎮 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for React
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **TypeScript** - Type-safe server development
- **Socket.IO** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing

### Development Tools
- **Concurrently** - Run multiple npm commands simultaneously
- **Nodemon** - Auto-restart server on file changes
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🎭 Game Strategy

- **Weapon Selection**: Choose strategically each round - higher power weapons are more valuable
- **Rarity Matters**: Legendary weapons (Power 95-100) are game-changers
- **Round Priority**: Focus on winning to steal opponent's best weapons
- **Adaptation**: Adjust strategy based on what weapons you've collected
- **Endgame**: Once ahead in weapons, play defensively to protect your lead

## 🌐 API Endpoints

### REST API
- `GET /api/health` - Server health check
- `GET /api/games` - List active games
- `GET /api/games/:id` - Get specific game state

### Socket.IO Events
- `join-game` - Join or create a game
- `select-weapon` - Choose weapon for current round
- `make-move` - Make move on tic-tac-toe board
- `next-round` - Start next round
- `game-updated` - Receive game state updates
- `round-ended` - Round result notification

## 🚀 Deployment

### Environment Variables
```bash
# Backend
PORT=3001
FRONTEND_URL=http://localhost:3000

# Frontend
REACT_APP_BACKEND_URL=http://localhost:3001
```

### Docker Support (Future)
- Backend containerization
- Frontend build optimization
- Multi-stage builds
- Container orchestration

## 🎯 Future Enhancements

### Immediate Roadmap
- **Sound effects** - Audio feedback for actions
- **Particle effects** - Visual weapon effects
- **Tournament mode** - Bracket-style competitions
- **Spectator mode** - Watch ongoing battles

### Long-term Vision
- **AI opponents** - Single-player mode with smart AI
- **More universes** - Star Wars, Anime, Gaming weapons
- **Custom weapons** - Player-created weapon systems
- **Leaderboards** - Global ranking system
- **Clans/Teams** - Social features and team battles

## 🎈 Credits

Developed as a modern, real-time multiplayer game that fuses classic tic-tac-toe strategy with RPG-style weapon collection mechanics. Built with cutting-edge web technologies for the ultimate gaming experience!

---

**Ready to battle for the ultimate weapon collection?** 

Run `npm run dev` and enter the epic arena! ⚔️🚀

### Game URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health 