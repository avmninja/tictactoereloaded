export declare const config: {
    readonly port: number;
    readonly host: string;
    readonly environment: string;
    readonly isProduction: boolean;
    readonly isDevelopment: boolean;
    readonly corsOrigin: string | string[];
    readonly socketCors: {
        readonly origin: string | string[];
        readonly methods: string[];
    };
    readonly maxPlayersPerGame: 2;
    readonly gameTimeout: number;
    readonly maxActiveGames: number;
    readonly enableVerboseLogs: boolean;
    readonly logLevel: string;
    readonly enableRateLimit: boolean;
    readonly rateLimitWindowMs: number;
    readonly rateLimitMaxRequests: number;
    readonly healthCheckInterval: number;
    readonly version: string;
    readonly appName: "Tic-Tac-Toe Weapon Collection";
};
export declare const validateEnvironment: () => void;
export default config;
//# sourceMappingURL=environment.d.ts.map