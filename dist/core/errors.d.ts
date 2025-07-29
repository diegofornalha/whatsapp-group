/**
 * Custom error classes and error handling utilities
 */
/**
 * Base error class for application-specific errors
 */
export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode?: number;
    readonly details?: any;
    readonly timestamp: Date;
    readonly isOperational: boolean;
    constructor(message: string, code: string, statusCode?: number, isOperational?: boolean, details?: any);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        statusCode: number | undefined;
        details: any;
        timestamp: Date;
        stack: string | undefined;
    };
}
/**
 * Service-related errors
 */
export declare class ServiceError extends AppError {
    constructor(message: string, code: string, details?: any);
}
export declare class ServiceNotFoundError extends ServiceError {
    constructor(serviceId: string);
}
export declare class ServiceAlreadyExistsError extends ServiceError {
    constructor(serviceId: string);
}
export declare class ServiceStartError extends ServiceError {
    constructor(serviceName: string, originalError?: Error);
}
/**
 * Configuration errors
 */
export declare class ConfigError extends AppError {
    constructor(message: string, path?: string, value?: any);
}
export declare class ConfigValidationError extends ConfigError {
    constructor(errors: Array<{
        path: string;
        message: string;
    }>);
}
/**
 * WhatsApp-related errors
 */
export declare class WhatsAppError extends AppError {
    constructor(message: string, code: string, details?: any);
}
export declare class WhatsAppConnectionError extends WhatsAppError {
    constructor(message: string, retryable?: boolean);
}
export declare class WhatsAppAuthenticationError extends WhatsAppError {
    constructor(message: string);
}
export declare class WhatsAppQRCodeError extends WhatsAppError {
    constructor(attemptNumber: number, maxAttempts: number);
}
/**
 * Extraction errors
 */
export declare class ExtractionError extends AppError {
    constructor(message: string, code: string, details?: any);
}
export declare class GroupNotFoundError extends ExtractionError {
    constructor(groupId: string);
}
export declare class MemberNotFoundError extends ExtractionError {
    constructor(identifier: string);
}
export declare class ExtractionTimeoutError extends ExtractionError {
    constructor(operation: string, timeout: number);
}
/**
 * Storage errors
 */
export declare class StorageError extends AppError {
    constructor(message: string, code: string, details?: any);
}
export declare class StorageConnectionError extends StorageError {
    constructor(message: string, type: string);
}
export declare class StorageOperationError extends StorageError {
    constructor(operation: string, message: string);
}
/**
 * Export errors
 */
export declare class ExportError extends AppError {
    constructor(message: string, code: string, details?: any);
}
export declare class ExportFormatError extends ExportError {
    constructor(format: string);
}
export declare class ExportSizeError extends ExportError {
    constructor(size: number, maxSize: number);
}
/**
 * Validation errors
 */
export declare class ValidationError extends AppError {
    constructor(message: string, field?: string, value?: any);
}
/**
 * Rate limiting errors
 */
export declare class RateLimitError extends AppError {
    constructor(limit: number, window: number, retryAfter: number);
}
/**
 * Error handler utility
 */
export declare class ErrorHandler {
    private static isDevelopment;
    /**
     * Handle error and determine if it's operational
     */
    static handle(error: Error): AppError;
    /**
     * Format error for response
     */
    static format(error: AppError): any;
    /**
     * Check if error is operational (safe to expose to client)
     */
    static isOperational(error: Error): boolean;
    /**
     * Create error from status code
     */
    static fromStatusCode(statusCode: number, message?: string): AppError;
}
/**
 * Error recovery strategies
 */
export interface RecoveryStrategy {
    canRecover(error: Error): boolean;
    recover(error: Error): Promise<void>;
}
export declare class RetryStrategy implements RecoveryStrategy {
    private maxRetries;
    private delay;
    private backoff;
    constructor(maxRetries?: number, delay?: number, backoff?: number);
    canRecover(error: Error): boolean;
    recover(error: Error): Promise<void>;
    calculateDelay(attempt: number): number;
}
/**
 * Global error event emitter
 */
export declare class ErrorEmitter {
    private static handlers;
    static on(handler: (error: Error) => void): void;
    static off(handler: (error: Error) => void): void;
    static emit(error: Error): void;
}
//# sourceMappingURL=errors.d.ts.map