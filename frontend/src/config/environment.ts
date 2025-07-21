// Environment Configuration
export const config = {
  // API Configuration
  backendUrl: process.env.REACT_APP_BACKEND_URL || (() => {
    if (process.env.NODE_ENV === 'production') {
      // In production, use the same host with port 3001
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      return `${protocol}//${hostname}:3001`;
    }
    return 'http://localhost:3001';
  })(),

  // App Configuration
  version: process.env.REACT_APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  
  // Socket.IO Configuration
  socketTimeout: parseInt(process.env.REACT_APP_SOCKET_TIMEOUT || '10000'),
  
  // Feature Flags
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
  enableConsoleLogs: process.env.REACT_APP_ENABLE_CONSOLE_LOGS !== 'false',

  // Build Configuration
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Game Configuration
  maxGameRounds: 10,
  weaponsPerUniverse: 5,
  aiMoveDelay: 1000,
  
  // UI Configuration
  animationDuration: 500,
  toastTimeout: 3000,
} as const;

// Type-safe environment checker
export const validateEnvironment = (): void => {
  const requiredEnvVars: string[] = [];
  
  // Check required environment variables
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    if (config.isProduction) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
  
  if (config.enableConsoleLogs) {
    console.log('🔧 Environment Configuration:', {
      environment: config.environment,
      backendUrl: config.backendUrl,
      version: config.version,
      isProduction: config.isProduction,
    });
  }
};

export default config; 