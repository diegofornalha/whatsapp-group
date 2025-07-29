/**
 * Rate Limiter Implementation
 * Prevents abuse and excessive API calls
 */
interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
    keyPrefix?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}
interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
}
export declare class RateLimiter {
    private stores;
    private cleanupInterval;
    constructor();
    /**
     * Check if request is allowed based on rate limit
     */
    checkLimit(key: string, options: RateLimitOptions): Promise<RateLimitResult>;
    /**
     * Create middleware for Express/Koa style frameworks
     */
    middleware(options: RateLimitOptions): (req: any, res: any, next: any) => Promise<void>;
    /**
     * Extract identifier from request
     */
    private extractKey;
    /**
     * Cleanup expired entries
     */
    private cleanup;
    /**
     * Reset rate limit for specific key
     */
    reset(key: string, prefix?: string): void;
    /**
     * Get current usage for key
     */
    getUsage(key: string, prefix?: string): {
        count: number;
        resetAt: Date;
    } | null;
    /**
     * Destroy rate limiter and cleanup
     */
    destroy(): void;
}
export declare const RateLimitPresets: {
    strict: {
        windowMs: number;
        maxRequests: number;
    };
    normal: {
        windowMs: number;
        maxRequests: number;
    };
    relaxed: {
        windowMs: number;
        maxRequests: number;
    };
    api: {
        windowMs: number;
        maxRequests: number;
    };
    auth: {
        windowMs: number;
        maxRequests: number;
    };
};
export declare const rateLimiter: RateLimiter;
export {};
//# sourceMappingURL=RateLimiter.d.ts.map