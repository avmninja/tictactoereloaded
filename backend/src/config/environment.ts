// Backend Environment Configuration
export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3001'),
  host: process.env.HOST || '0.0.0.0',
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || (
    process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : ['http://localhost:3000', 'http://127.0.0.1:3000']
  ),
  
  // Socket.IO Configuration
  socketCors: {
    origin: process.env.SOCKET_CORS_ORIGIN || (
      process.env.NODE_ENV === 'production'
        ? 'https://your-domain.com'
        : ['http://localhost:3000', 'http://127.0.0.1:3000']
    ),
    methods: ['GET', 'POST'] as string[]
  },
  
  // Game Configuration
  maxPlayersPerGame: 2,
  gameTimeout: parseInt(process.env.GAME_TIMEOUT || '300000'), // 5 minutes
  maxActiveGames: parseInt(process.env.MAX_ACTIVE_GAMES || '100'),
  
  // Logging Configuration
  enableVerboseLogs: process.env.ENABLE_VERBOSE_LOGS === 'true',
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),
  
  // Security Configuration
  enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // Health Check Configuration
  healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'), // 30 seconds
  
  // App Information
  version: process.env.APP_VERSION || '1.0.0',
  appName: 'Tic-Tac-Toe Weapon Collection',
} as const;

// Type-safe environment validator
export const validateEnvironment = (): void => {
  const requiredEnvVars: string[] = [
    // Add required environment variables here
    // 'DATABASE_URL',
    // 'JWT_SECRET',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    if (config.isProduction) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
  
  // Validate numeric values
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error(`Invalid port number: ${process.env.PORT}`);
  }
  
  if (config.enableVerboseLogs || config.isDevelopment) {
    console.log('🔧 Backend Environment Configuration:', {
      environment: config.environment,
      port: config.port,
      host: config.host,
      version: config.version,
      isProduction: config.isProduction,
      corsOrigin: config.corsOrigin,
    });
  }
};

export default config; 