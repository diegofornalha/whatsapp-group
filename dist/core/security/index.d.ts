/**
 * Security Module Exports
 * Central export point for all security components
 */
export { RateLimiter, RateLimitPresets, rateLimiter } from './RateLimiter';
export { AnomalyDetector, AnomalyPattern, AnomalyEvent, anomalyDetector } from './AnomalyDetector';
export { InputValidator, ValidationSchema, ValidationResult, CommonSchemas, inputValidator } from './InputValidator';
export { AuditLogger, AuditEvent, AuditEventType, AuditReport, auditLogger } from './AuditLogger';
export { SecurityManager, SecurityConfig, SecurityContext, securityManager } from './SecurityManager';
export { SecureDataHandler, SecureDataWrapper, DataClassification, secureDataHandler } from './SecureDataHandler';
export declare const SecurityConfigs: {
    rateLimits: any;
    validationSchemas: any;
    auditFormats: any;
    securityPolicies: any;
};
export declare const SecurityUtils: {
    /**
     * Initialize all security components with configuration
     */
    initialize: (config?: any) => {
        rateLimiter: any;
        anomalyDetector: any;
        inputValidator: any;
        auditLogger: any;
        securityManager: any;
        secureDataHandler: any;
    };
    /**
     * Create Express middleware stack
     */
    createMiddlewareStack: () => any[];
    /**
     * Create authenticated middleware stack
     */
    createAuthMiddlewareStack: (requiredPermissions?: string[]) => any[];
};
export type { RateLimitOptions, RateLimitResult } from './RateLimiter';
export type { ValidationRule, ValidationError } from './InputValidator';
export type { AuditQuery, AuditLoggerOptions } from './AuditLogger';
export type { SecurityCheckResult } from './SecurityManager';
export type { SecureDataOptions } from './SecureDataHandler';
//# sourceMappingURL=index.d.ts.map