/**
 * Security Module Exports
 * Central export point for all security components
 */
// Core security components
export { RateLimiter, RateLimitPresets, rateLimiter } from './RateLimiter';
export { AnomalyDetector, anomalyDetector } from './AnomalyDetector';
export { InputValidator, CommonSchemas, inputValidator } from './InputValidator';
export { AuditLogger, AuditEventType, auditLogger } from './AuditLogger';
export { SecurityManager, securityManager } from './SecurityManager';
export { SecureDataHandler, SecureDataWrapper, secureDataHandler } from './SecureDataHandler';
// Configuration loaders
import * as fs from 'fs';
import * as path from 'path';
const configDir = path.join(__dirname, 'config');
export const SecurityConfigs = {
    rateLimits: JSON.parse(fs.readFileSync(path.join(configDir, 'rate-limits.json'), 'utf-8')),
    validationSchemas: JSON.parse(fs.readFileSync(path.join(configDir, 'validation-schemas.json'), 'utf-8')),
    auditFormats: JSON.parse(fs.readFileSync(path.join(configDir, 'audit-formats.json'), 'utf-8')),
    securityPolicies: JSON.parse(fs.readFileSync(path.join(configDir, 'security-policies.json'), 'utf-8'))
};
// Utility functions
export const SecurityUtils = {
    /**
     * Initialize all security components with configuration
     */
    initialize: (config) => {
        const securityConfig = {
            ...SecurityConfigs.securityPolicies,
            ...config
        };
        // Configure security manager
        securityManager.updateConfig(securityConfig);
        // Add validation schemas
        Object.entries(SecurityConfigs.validationSchemas.schemas).forEach(([name, schema]) => {
            securityManager.getConfig().inputValidation.schemas[name] = schema;
        });
        return {
            rateLimiter,
            anomalyDetector,
            inputValidator,
            auditLogger,
            securityManager,
            secureDataHandler
        };
    },
    /**
     * Create Express middleware stack
     */
    createMiddlewareStack: () => {
        return [
            // Audit logging
            auditLogger.middleware(),
            // Rate limiting
            rateLimiter.middleware(RateLimitPresets.normal),
            // Security checks
            securityManager.middleware({
                requireAuth: false,
                rateLimit: 'normal'
            })
        ];
    },
    /**
     * Create authenticated middleware stack
     */
    createAuthMiddlewareStack: (requiredPermissions) => {
        return [
            // Audit logging
            auditLogger.middleware(),
            // Rate limiting
            rateLimiter.middleware(RateLimitPresets.normal),
            // Security checks with auth
            securityManager.middleware({
                requireAuth: true,
                requiredPermissions,
                rateLimit: 'normal'
            })
        ];
    }
};
//# sourceMappingURL=index.js.map