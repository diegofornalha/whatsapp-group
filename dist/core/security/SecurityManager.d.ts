/**
 * Security Manager
 * Orchestrates all security features and provides a unified security interface
 */
/// <reference types="node" />
/// <reference types="node" />
import { RateLimitPresets } from './RateLimiter';
import { ValidationSchema, ValidationResult } from './InputValidator';
import { EventEmitter } from 'events';
export interface SecurityConfig {
    rateLimiting: {
        enabled: boolean;
        presets: typeof RateLimitPresets;
        custom?: Record<string, any>;
    };
    anomalyDetection: {
        enabled: boolean;
        patterns: string[];
        customPatterns?: any[];
    };
    inputValidation: {
        enabled: boolean;
        schemas: Record<string, ValidationSchema>;
    };
    auditLogging: {
        enabled: boolean;
        logDir?: string;
        retentionDays?: number;
    };
    encryption: {
        algorithm: string;
        keyLength: number;
    };
    authentication: {
        sessionTimeout: number;
        maxFailedAttempts: number;
        lockoutDuration: number;
    };
}
export interface SecurityContext {
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    permissions?: string[];
    metadata?: Record<string, any>;
}
export interface SecurityCheckResult {
    allowed: boolean;
    reasons: string[];
    actions: string[];
    context?: any;
}
export declare class SecurityManager extends EventEmitter {
    private static instance;
    private rateLimiter;
    private anomalyDetector;
    private inputValidator;
    private auditLogger;
    private config;
    private sessions;
    private failedAttempts;
    private lockedUsers;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(config?: Partial<SecurityConfig>): SecurityManager;
    /**
     * Initialize security manager
     */
    private initialize;
    /**
     * Perform comprehensive security check
     */
    checkSecurity(operation: string, data: any, context: SecurityContext): Promise<SecurityCheckResult>;
    /**
     * Validate input data
     */
    validateInput(data: any, schemaName: string): ValidationResult;
    /**
     * Create secure session
     */
    createSession(context: SecurityContext): string;
    /**
     * Validate session
     */
    validateSession(sessionId: string): SecurityContext | null;
    /**
     * Destroy session
     */
    destroySession(sessionId: string): void;
    /**
     * Record failed authentication attempt
     */
    recordFailedAttempt(userId: string): void;
    /**
     * Reset failed attempts
     */
    resetFailedAttempts(userId: string): void;
    /**
     * Lock user account
     */
    private lockUser;
    /**
     * Check if user is locked
     */
    private isUserLocked;
    /**
     * Encrypt sensitive data
     */
    encrypt(data: string, key?: Buffer): {
        encrypted: string;
        iv: string;
        tag: string;
    };
    /**
     * Decrypt sensitive data
     */
    decrypt(encryptedData: string, key: Buffer, iv: string, tag: string): string;
    /**
     * Generate secure token
     */
    generateToken(length?: number): string;
    /**
     * Hash password
     */
    hashPassword(password: string): Promise<string>;
    /**
     * Verify password
     */
    verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
    /**
     * Create security middleware
     */
    middleware(options?: {
        requireAuth?: boolean;
        requiredPermissions?: string[];
        rateLimit?: keyof typeof RateLimitPresets;
        validateInput?: string;
    }): (req: any, res: any, next: any) => Promise<any>;
    /**
     * Handle security alert
     */
    private handleSecurityAlert;
    /**
     * Handle security block
     */
    private handleSecurityBlock;
    /**
     * Generate session ID
     */
    private generateSessionId;
    /**
     * Get security statistics
     */
    getStatistics(): Promise<any>;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<SecurityConfig>): void;
    /**
     * Get configuration
     */
    getConfig(): SecurityConfig;
}
export declare const securityManager: SecurityManager;
//# sourceMappingURL=SecurityManager.d.ts.map