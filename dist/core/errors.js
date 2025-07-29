/**
 * Custom error classes and error handling utilities
 */
/**
 * Base error class for application-specific errors
 */
export class AppError extends Error {
    constructor(message, code, statusCode, isOperational = true, details) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        this.timestamp = new Date();
        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack,
        };
    }
}
/**
 * Service-related errors
 */
export class ServiceError extends AppError {
    constructor(message, code, details) {
        super(message, code, 503, true, details);
    }
}
export class ServiceNotFoundError extends ServiceError {
    constructor(serviceId) {
        super(`Service not found: ${serviceId}`, 'SERVICE_NOT_FOUND', { serviceId });
    }
}
export class ServiceAlreadyExistsError extends ServiceError {
    constructor(serviceId) {
        super(`Service already exists: ${serviceId}`, 'SERVICE_ALREADY_EXISTS', { serviceId });
    }
}
export class ServiceStartError extends ServiceError {
    constructor(serviceName, originalError) {
        super(`Failed to start service: ${serviceName}`, 'SERVICE_START_ERROR', { serviceName, originalError: originalError?.message });
    }
}
/**
 * Configuration errors
 */
export class ConfigError extends AppError {
    constructor(message, path, value) {
        super(message, 'CONFIG_ERROR', 500, true, { path, value });
    }
}
export class ConfigValidationError extends ConfigError {
    constructor(errors) {
        const message = `Configuration validation failed:\n${errors
            .map(e => `- ${e.path}: ${e.message}`)
            .join('\n')}`;
        super(message, undefined, errors);
    }
}
/**
 * WhatsApp-related errors
 */
export class WhatsAppError extends AppError {
    constructor(message, code, details) {
        super(message, code, 400, true, details);
    }
}
export class WhatsAppConnectionError extends WhatsAppError {
    constructor(message, retryable = true) {
        super(message, 'WHATSAPP_CONNECTION_ERROR', { retryable });
    }
}
export class WhatsAppAuthenticationError extends WhatsAppError {
    constructor(message) {
        super(message, 'WHATSAPP_AUTH_ERROR');
    }
}
export class WhatsAppQRCodeError extends WhatsAppError {
    constructor(attemptNumber, maxAttempts) {
        super(`QR code generation failed (attempt ${attemptNumber}/${maxAttempts})`, 'WHATSAPP_QR_ERROR', { attemptNumber, maxAttempts });
    }
}
/**
 * Extraction errors
 */
export class ExtractionError extends AppError {
    constructor(message, code, details) {
        super(message, code, 422, true, details);
    }
}
export class GroupNotFoundError extends ExtractionError {
    constructor(groupId) {
        super(`Group not found: ${groupId}`, 'GROUP_NOT_FOUND', { groupId });
    }
}
export class MemberNotFoundError extends ExtractionError {
    constructor(identifier) {
        super(`Member not found: ${identifier}`, 'MEMBER_NOT_FOUND', { identifier });
    }
}
export class ExtractionTimeoutError extends ExtractionError {
    constructor(operation, timeout) {
        super(`Extraction operation timed out: ${operation}`, 'EXTRACTION_TIMEOUT', { operation, timeout });
    }
}
/**
 * Storage errors
 */
export class StorageError extends AppError {
    constructor(message, code, details) {
        super(message, code, 500, true, details);
    }
}
export class StorageConnectionError extends StorageError {
    constructor(message, type) {
        super(message, 'STORAGE_CONNECTION_ERROR', { type });
    }
}
export class StorageOperationError extends StorageError {
    constructor(operation, message) {
        super(`Storage operation failed: ${operation} - ${message}`, 'STORAGE_OPERATION_ERROR', {
            operation,
        });
    }
}
/**
 * Export errors
 */
export class ExportError extends AppError {
    constructor(message, code, details) {
        super(message, code, 422, true, details);
    }
}
export class ExportFormatError extends ExportError {
    constructor(format) {
        super(`Unsupported export format: ${format}`, 'EXPORT_FORMAT_ERROR', { format });
    }
}
export class ExportSizeError extends ExportError {
    constructor(size, maxSize) {
        super(`Export size exceeds maximum allowed: ${size} > ${maxSize}`, 'EXPORT_SIZE_ERROR', { size, maxSize });
    }
}
/**
 * Validation errors
 */
export class ValidationError extends AppError {
    constructor(message, field, value) {
        super(message, 'VALIDATION_ERROR', 400, true, { field, value });
    }
}
/**
 * Rate limiting errors
 */
export class RateLimitError extends AppError {
    constructor(limit, window, retryAfter) {
        super(`Rate limit exceeded: ${limit} requests per ${window}ms`, 'RATE_LIMIT_ERROR', 429, true, { limit, window, retryAfter });
    }
}
/**
 * Error handler utility
 */
export class ErrorHandler {
    /**
     * Handle error and determine if it's operational
     */
    static handle(error) {
        if (error instanceof AppError) {
            return error;
        }
        // Convert known error types
        if (error.name === 'ValidationError') {
            return new ValidationError(error.message);
        }
        if (error.name === 'TypeError') {
            return new AppError(error.message, 'TYPE_ERROR', 500, false);
        }
        if (error.name === 'ReferenceError') {
            return new AppError(error.message, 'REFERENCE_ERROR', 500, false);
        }
        // Default to generic app error
        return new AppError(error.message || 'An unexpected error occurred', 'INTERNAL_ERROR', 500, false);
    }
    /**
     * Format error for response
     */
    static format(error) {
        const formatted = {
            error: {
                message: error.message,
                code: error.code,
                timestamp: error.timestamp,
            },
        };
        if (error.statusCode) {
            formatted.error.statusCode = error.statusCode;
        }
        if (this.isDevelopment) {
            formatted.error.details = error.details;
            formatted.error.stack = error.stack;
        }
        return formatted;
    }
    /**
     * Check if error is operational (safe to expose to client)
     */
    static isOperational(error) {
        if (error instanceof AppError) {
            return error.isOperational;
        }
        return false;
    }
    /**
     * Create error from status code
     */
    static fromStatusCode(statusCode, message) {
        const statusMessages = {
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            422: 'Unprocessable Entity',
            429: 'Too Many Requests',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable',
        };
        const defaultMessage = statusMessages[statusCode] || 'Unknown Error';
        return new AppError(message || defaultMessage, `HTTP_${statusCode}`, statusCode, statusCode < 500);
    }
}
ErrorHandler.isDevelopment = process.env.NODE_ENV === 'development';
export class RetryStrategy {
    constructor(maxRetries = 3, delay = 1000, backoff = 2) {
        this.maxRetries = maxRetries;
        this.delay = delay;
        this.backoff = backoff;
    }
    canRecover(error) {
        if (error instanceof AppError) {
            return error.isOperational && error.code !== 'RATE_LIMIT_ERROR';
        }
        return false;
    }
    async recover(error) {
        // Implementation would be in the calling code
        throw new Error('Retry strategy should be implemented by the caller');
    }
    calculateDelay(attempt) {
        return this.delay * Math.pow(this.backoff, attempt - 1);
    }
}
/**
 * Global error event emitter
 */
export class ErrorEmitter {
    static on(handler) {
        this.handlers.push(handler);
    }
    static off(handler) {
        const index = this.handlers.indexOf(handler);
        if (index !== -1) {
            this.handlers.splice(index, 1);
        }
    }
    static emit(error) {
        for (const handler of this.handlers) {
            try {
                handler(error);
            }
            catch (err) {
                console.error('Error in error handler:', err);
            }
        }
    }
}
ErrorEmitter.handlers = [];
//# sourceMappingURL=errors.js.map