/**
 * Audit Logger
 * Comprehensive audit logging for compliance and security tracking
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
export interface AuditEvent {
    id: string;
    timestamp: Date;
    type: AuditEventType;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    action: string;
    resource?: string;
    result: 'success' | 'failure' | 'error';
    details?: any;
    metadata?: Record<string, any>;
    hash?: string;
}
export declare enum AuditEventType {
    AUTHENTICATION = "authentication",
    AUTHORIZATION = "authorization",
    DATA_ACCESS = "data_access",
    DATA_MODIFICATION = "data_modification",
    DATA_DELETION = "data_deletion",
    CONFIGURATION_CHANGE = "configuration_change",
    SECURITY_EVENT = "security_event",
    SYSTEM_ACCESS = "system_access",
    API_ACCESS = "api_access",
    ERROR = "error",
    CUSTOM = "custom"
}
export interface AuditLoggerOptions {
    logDir: string;
    maxFileSize: number;
    maxFiles: number;
    hashAlgorithm: string;
    encryptLogs: boolean;
    compressLogs: boolean;
    retentionDays: number;
}
export interface AuditQuery {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    type?: AuditEventType;
    action?: string;
    result?: string;
    limit?: number;
    offset?: number;
}
export interface AuditReport {
    totalEvents: number;
    byType: Record<string, number>;
    byResult: Record<string, number>;
    byUser: Record<string, number>;
    timeline: {
        date: string;
        count: number;
    }[];
    topActions: {
        action: string;
        count: number;
    }[];
    securityEvents: AuditEvent[];
}
export declare class AuditLogger extends EventEmitter {
    private options;
    private currentFile;
    private fileStream;
    private eventBuffer;
    private flushInterval;
    constructor(options?: Partial<AuditLoggerOptions>);
    /**
     * Initialize audit logger
     */
    private initialize;
    /**
     * Log an audit event
     */
    log(event: Partial<AuditEvent>): Promise<void>;
    /**
     * Authentication event logging
     */
    logAuthentication(userId: string, action: 'login' | 'logout' | 'failed_login', result: 'success' | 'failure', details?: any): Promise<void>;
    /**
     * Data access event logging
     */
    logDataAccess(userId: string, resource: string, action: string, result: 'success' | 'failure', details?: any): Promise<void>;
    /**
     * Security event logging
     */
    logSecurityEvent(action: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any): Promise<void>;
    /**
     * API access logging
     */
    logApiAccess(userId: string, endpoint: string, method: string, statusCode: number, responseTime: number): Promise<void>;
    /**
     * Flush buffer to file
     */
    private flush;
    /**
     * Rotate log file
     */
    private rotateFile;
    /**
     * Query audit logs
     */
    query(query: AuditQuery): Promise<AuditEvent[]>;
    /**
     * Generate audit report
     */
    generateReport(startDate: Date, endDate: Date): Promise<AuditReport>;
    /**
     * Export audit logs
     */
    export(format: 'json' | 'csv', query: AuditQuery): Promise<string>;
    /**
     * Verify audit log integrity
     */
    verifyIntegrity(file: string): Promise<boolean>;
    /**
     * Generate event ID
     */
    private generateEventId;
    /**
     * Generate hash for event
     */
    private generateHash;
    /**
     * Check if event is critical
     */
    private isCriticalEvent;
    /**
     * Get log files
     */
    private getLogFiles;
    /**
     * Read log file
     */
    private readLogFile;
    /**
     * Check if event matches query
     */
    private matchesQuery;
    /**
     * Clean up old logs
     */
    private cleanupOldLogs;
    /**
     * Create middleware for Express/Koa
     */
    middleware(): (req: any, res: any, next: any) => Promise<void>;
    /**
     * Destroy audit logger
     */
    destroy(): void;
}
export declare const auditLogger: AuditLogger;
//# sourceMappingURL=AuditLogger.d.ts.map