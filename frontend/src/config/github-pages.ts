// GitHub Pages deployment configuration
export const githubPagesConfig = {
  // Set this to your GitHub Pages URL
  publicUrl: process.env.PUBLIC_URL || 'https://yourusername.github.io/tictactoereloaded',
  
  // Backend configuration for GitHub Pages
  // Option 1: External backend (recommended for full functionality)
  // Set this to your deployed backend URL (Heroku, Railway, Render, etc.)
  backendUrl: process.env.REACT_APP_BACKEND_URL || '',
  
  // Option 2: Static mode (no backend required)
  // When true, only single-player and local multiplayer modes work
  staticMode: process.env.REACT_APP_STATIC_MODE === 'true' || !process.env.REACT_APP_BACKEND_URL,
  
  // Production optimizations
  enableConsole: process.env.REACT_APP_ENABLE_CONSOLE_LOGS === 'true',
  debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
};

// Helper function to check if we're running on GitHub Pages
export const isGitHubPages = (): boolean => {
  return window.location.hostname.includes('github.io');
};

// Helper function to get the correct backend URL
export const getBackendUrl = (): string => {
  if (githubPagesConfig.staticMode) {
    return ''; // No backend in static mode
  }
  
  // Use external backend URL for GitHub Pages
  if (isGitHubPages() && githubPagesConfig.backendUrl) {
    return githubPagesConfig.backendUrl;
  }
  
  // Development fallback
  return 'http://localhost:3001';
};

export default githubPagesConfig; 