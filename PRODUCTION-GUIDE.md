# 🚀 Production Deployment Guide

## Tic-Tac-Toe Weapon Collection Game - Production Setup

This guide covers how to deploy and run the Tic-Tac-Toe Weapon Collection Game in production.

## ✅ Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** 8.0.0 or higher
- **curl** (for health checks)
- **jq** (optional, for JSON formatting)

## 🏗️ Production Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd tictactoereloaded
npm run install:all
```

### 2. Build for Production

```bash
npm run build
```

This creates:
- `backend/dist/` - Compiled TypeScript backend
- `frontend/build/` - Optimized React build

### 3. Start Production Servers

```bash
npm run production:start
```

This will:
- ✅ Clean up any existing processes on ports 3000/3001
- ✅ Start backend server on port 3001
- ✅ Start frontend server on port 3000  
- ✅ Verify both servers are running
- ✅ Save process IDs for clean shutdown

### 4. Stop Production Servers

```bash
npm run production:stop
```

## 🔍 Verification

### Backend Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-21T02:50:06.622Z",
  "version": "1.0.0",
  "environment": "production",
  "activeGames": 0,
  "connectedPlayers": 0,
  "uptime": 15.193321708
}
```

### Frontend Verification
```bash
curl -I http://localhost:3000
```

Should return `200 OK` with HTML content.

## 📊 Monitoring & Logs

### View Real-time Logs
```bash
tail -f logs/backend.log logs/frontend.log
```

### Check Server Status
```bash
npm run health:check
```

### Process Information
- Backend PID stored in: `logs/backend.pid`
- Frontend PID stored in: `logs/frontend.pid`
- Logs stored in: `logs/backend.log`, `logs/frontend.log`

## 🌐 Production Environment Variables

### Backend (.env in backend/ directory)
```bash
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
CORS_ORIGIN=https://your-domain.com
SOCKET_CORS_ORIGIN=https://your-domain.com
MAX_ACTIVE_GAMES=100
GAME_TIMEOUT=300000
ENABLE_RATE_LIMIT=true
ENABLE_VERBOSE_LOGS=false
LOG_LEVEL=warn
```

### Frontend (.env in frontend/ directory)
```bash
REACT_APP_BACKEND_URL=https://your-backend-domain.com
NODE_ENV=production
GENERATE_SOURCEMAP=false
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_CONSOLE_LOGS=false
REACT_APP_DEBUG_MODE=false
```

## 🐳 Docker Production Deployment

### Build Docker Image
```bash
npm run docker:build
```

### Run with Docker
```bash
npm run docker:run
```

### Manual Docker Commands
```bash
# Build
docker build -t tictactoe-game .

# Run
docker run -d \
  --name tictactoe-prod \
  -p 3001:3001 \
  -e NODE_ENV=production \
  tictactoe-game

# Check logs
docker logs tictactoe-prod

# Stop
docker stop tictactoe-prod
```

## ☁️ Cloud Deployment Options

### Heroku
```bash
# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://your-app-name.herokuapp.com

# Deploy
git push heroku main
```

### Vercel (Frontend only)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Railway/Render (Backend)
1. Connect your GitHub repository
2. Set build command: `npm run build:backend`
3. Set start command: `npm run start:backend`
4. Set environment variables as needed

### VPS/Cloud Server
1. Install Node.js and npm
2. Clone repository
3. Set up reverse proxy (nginx/apache)
4. Configure SSL certificates
5. Set up process manager (PM2)

#### Using PM2 Process Manager
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start backend/dist/index.js --name "tictactoe-backend"
pm2 serve frontend/build 3000 --name "tictactoe-frontend"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔒 Security Considerations

### Production Security Features Enabled:
- ✅ Security headers (XSS protection, content type options)
- ✅ CORS configuration
- ✅ Rate limiting preparation
- ✅ Non-root Docker user
- ✅ Environment variable validation
- ✅ Error handling without stack traces
- ✅ Game timeout and cleanup
- ✅ Input validation

### Additional Security Recommendations:
- Use HTTPS in production
- Set up proper firewall rules
- Use environment variables for secrets
- Implement rate limiting
- Regular security updates
- Monitor for vulnerabilities

## 🧪 Testing Production Build

### Automated Testing
```bash
npm run test
```

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create basic load test
echo 'config:
  target: "http://localhost:3001"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health check"
    requests:
      - get:
          url: "/health"' > loadtest.yml

# Run load test
artillery run loadtest.yml
```

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Build Failures
```bash
# Clean and rebuild
npm run clean
npm run install:all
npm run build
```

### Memory Issues
- Increase Node.js memory: `node --max-old-space-size=4096`
- Monitor with: `top` or `htop`
- Consider Docker memory limits

### Network Issues
- Check firewall settings
- Verify CORS configuration
- Test with: `telnet localhost 3001`

## 📈 Performance Optimization

### Frontend Optimizations:
- ✅ Code splitting implemented
- ✅ Bundle size optimized (~107KB gzipped)
- ✅ Source maps disabled in production
- ✅ Asset compression enabled

### Backend Optimizations:
- ✅ Gzip compression enabled
- ✅ Game cleanup automation
- ✅ Efficient Socket.IO configuration
- ✅ Memory leak prevention

### Monitoring Recommendations:
- Set up health check monitoring
- Monitor response times
- Track active games and connections
- Set up alerts for high resource usage

## 🎯 Production Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Security headers enabled
- [ ] CORS properly configured
- [ ] SSL certificates installed
- [ ] Health checks working
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Error logging configured
- [ ] Performance testing completed

## 📞 Support

For production deployment issues:
1. Check logs: `tail -f logs/*.log`
2. Verify health endpoints
3. Review environment configuration
4. Check network connectivity
5. Monitor resource usage

The production setup is designed to be robust, secure, and scalable for real-world deployment! 🚀 