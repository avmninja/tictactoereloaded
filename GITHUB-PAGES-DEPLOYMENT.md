# 🚀 GitHub Pages Deployment Guide

## Deploy Tic-Tac-Toe Weapon Collection Game to GitHub Pages

This guide shows you how to deploy the game to GitHub Pages for free static hosting.

## 📋 Prerequisites

- GitHub account
- Git installed locally
- Node.js 16+ and npm 8+

## 🔧 Setup Instructions

### 1. Update Homepage URL

Edit `frontend/package.json` and replace `yourusername` with your GitHub username:

```json
{
  "homepage": "https://yourusername.github.io/tictactoereloaded"
}
```

### 2. Configure GitHub Pages Backend (Optional)

If you want to enable online multiplayer, you'll need to deploy the backend separately. Update `frontend/src/config/github-pages.ts`:

```typescript
export const githubPagesConfig = {
  // Set this to your deployed backend URL
  backendUrl: 'https://your-backend-app.herokuapp.com', // Change this!
  staticMode: false, // Set to false if you have a backend
  // ... rest of config
};
```

### 3. Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Install GitHub Pages deployment tool
cd frontend
npm install
```

## 🚀 Deployment Options

### Option A: Automatic Deployment with GitHub Actions (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages in repository settings:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will run automatically on each push

3. **Access your deployed app:**
   - Your app will be available at: `https://yourusername.github.io/tictactoereloaded`
   - Check the **Actions** tab to monitor deployment progress

### Option B: Manual Deployment

1. **Build and deploy:**
   ```bash
   # From project root
   npm run github-pages:deploy
   ```

2. **Enable GitHub Pages:**
   - Go to repository **Settings** → **Pages**
   - Set source to **Deploy from a branch**
   - Select **gh-pages** branch
   - Click **Save**

3. **Access your app:**
   - Available at: `https://yourusername.github.io/tictactoereloaded`

## 🎮 Available Game Modes on GitHub Pages

### ✅ Fully Functional (Static Mode)
- **🤖 Single Player** - Play against AI
- **👥 Local Multiplayer** - Two players on same device

### ❌ Requires Backend Server
- **🌐 Online Multiplayer** - Needs separate backend deployment

## 🔧 Backend Deployment for Online Multiplayer

To enable online multiplayer, deploy the backend to one of these services:

### Heroku (Free Tier Available)
```bash
# Install Heroku CLI, then:
heroku create your-tictactoe-backend
git subtree push --prefix backend heroku main

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://yourusername.github.io
```

### Railway
1. Connect your GitHub repository
2. Select the `backend` folder
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables:
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://yourusername.github.io`

### Render
1. Create new **Web Service**
2. Connect GitHub repository
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables as above

### After Backend Deployment
Update `frontend/src/config/github-pages.ts`:
```typescript
export const githubPagesConfig = {
  backendUrl: 'https://your-deployed-backend.herokuapp.com',
  staticMode: false,
  // ... rest unchanged
};
```

Then redeploy:
```bash
npm run github-pages:deploy
```

## 🔍 Verification

### Check Deployment Status
```bash
# Check GitHub Actions (if using automatic deployment)
# Go to repository → Actions tab

# Check manual deployment
git branch -a  # Should show 'remotes/origin/gh-pages'
```

### Test Your Deployed App
1. Visit: `https://yourusername.github.io/tictactoereloaded`
2. Try Single Player mode ✅
3. Try Local Multiplayer mode ✅
4. If you deployed backend, try Online Multiplayer ✅

## 🛠️ Troubleshooting

### Common Issues

#### 1. 404 Page Not Found
- Check GitHub Pages is enabled in repository settings
- Verify the repository is public (or you have GitHub Pro for private repos)
- Wait a few minutes for DNS propagation

#### 2. Blank White Screen
- Check browser console for errors
- Verify `homepage` URL is correct in `package.json`
- Try clearing browser cache

#### 3. Assets Not Loading
- Check if paths are correct (GitHub Pages adds repository name to path)
- Verify all files are in the `gh-pages` branch

#### 4. Online Multiplayer Not Working
- Verify backend is deployed and running
- Check CORS configuration matches your GitHub Pages URL
- Test backend health endpoint directly

### Debugging Commands
```bash
# Check if gh-pages branch exists
git ls-remote --heads origin

# Test backend health (replace with your backend URL)
curl https://your-backend.herokuapp.com/health

# Local testing with static mode
cd frontend
REACT_APP_STATIC_MODE=true npm start
```

## 📊 Monitoring

### GitHub Actions (Automatic Deployment)
- Monitor builds in **Actions** tab
- Check for deployment errors
- View deployment logs

### Manual Deployment
```bash
# Check deployment history
gh-pages --help

# View current deployed version
git log --oneline gh-pages -5
```

## 🔄 Updates and Maintenance

### Updating Your Deployed App
```bash
# Make your changes, then:
git add .
git commit -m "Update game features"
git push origin main

# For automatic deployment: GitHub Actions will handle it
# For manual deployment:
npm run github-pages:deploy
```

### Updating Dependencies
```bash
# Update frontend dependencies
cd frontend
npm update
npm audit fix

# Redeploy
npm run deploy
```

## 🌟 Optimization Tips

### Performance
- GitHub Pages serves static files with CDN
- Your app will load faster than local development
- Images and assets are cached automatically

### SEO and Sharing
- Add meta tags in `public/index.html`
- Create custom `favicon.ico`
- Add Open Graph tags for social sharing

### Custom Domain (Optional)
1. Add CNAME file to `public/` folder with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## 🎯 Next Steps

1. **✅ Deploy frontend to GitHub Pages**
2. **🔧 Deploy backend** (optional, for online multiplayer)
3. **🎨 Customize** your game
4. **📱 Share** your deployed game URL!

## 📞 Support

If you encounter issues:
1. Check GitHub Pages documentation
2. Verify all URLs and configurations
3. Test locally with `REACT_APP_STATIC_MODE=true`
4. Check browser console for errors

Your epic Marvel vs DC battle arena is now ready for the world! 🎮⚔️

## 🔗 Useful Links

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Heroku Node.js Deployment](https://devcenter.heroku.com/articles/deploying-nodejs)
- [Railway Deployment](https://railway.app/) 