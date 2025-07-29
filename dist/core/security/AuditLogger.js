/**
 * Audit Logger
 * Comprehensive audit logging for compliance and security tracking
 */
import { logger } from '../../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
export var AuditEventType;
(function (AuditEventType) {
    AuditEventType["AUTHENTICATION"] = "authentication";
    AuditEventType["AUTHORIZATION"] = "authorization";
    AuditEventType["DATA_ACCESS"] = "data_access";
    AuditEventType["DATA_MODIFICATION"] = "data_modification";
    AuditEventType["DATA_DELETION"] = "data_deletion";
    AuditEventType["CONFIGURATION_CHANGE"] = "configuration_change";
    AuditEventType["SECURITY_EVENT"] = "security_event";
    AuditEventType["SYSTEM_ACCESS"] = "system_access";
    AuditEventType["API_ACCESS"] = "api_access";
    AuditEventType["ERROR"] = "error";
    AuditEventType["CUSTOM"] = "custom";
})(AuditEventType || (AuditEventType = {}));
export class AuditLogger extends EventEmitter {
    constructor(options = {}) {
        super();
        this.fileStream = null;
        this.eventBuffer = [];
        this.flushInterval = null;
        this.options = {
            logDir: options.logDir || path.join(process.cwd(), 'audit-logs'),
            maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
            maxFiles: options.maxFiles || 30,
            hashAlgorithm: options.hashAlgorithm || 'sha256',
            encryptLogs: options.encryptLogs || false,
            compressLogs: options.compressLogs || false,
            retentionDays: options.retentionDays || 90
        };
        this.initialize();
    }
    /**
     * Initialize audit logger
     */
    initialize() {
        // Ensure log directory exists
        if (!fs.existsSync(this.options.logDir)) {
            fs.mkdirSync(this.options.logDir, { recursive: true });
        }
        // Set up current file
        this.rotateFile();
        // Set up flush interval
        this.flushInterval = setInterval(() => {
            this.flush();
        }, 5000); // Flush every 5 seconds
        // Clean up old logs
        this.cleanupOldLogs();
        logger.info('Audit logger initialized', { options: this.options });
    }
    /**
     * Log an audit event
     */
    async log(event) {
        const auditEvent = {
            id: this.generateEventId(),
            timestamp: new Date(),
            type: event.type || AuditEventType.CUSTOM,
            action: event.action || 'unknown',
            result: event.result || 'success',
            ...event
        };
        // Generate hash for integrity
        auditEvent.hash = this.generateHash(auditEvent);
        // Add to buffer
        this.eventBuffer.push(auditEvent);
        // Emit event
        this.emit('audit', auditEvent);
        // Check for critical events
        if (this.isCriticalEvent(auditEvent)) {
            this.emit('critical', auditEvent);
            await this.flush(); // Immediate flush for critical events
        }
        // Log to standard logger as well
        const logLevel = auditEvent.result === 'failure' ? 'warn' : 'info';
        logger[logLevel](`Audit: ${auditEvent.action}`, {
            type: auditEvent.type,
            userId: auditEvent.userId,
            result: auditEvent.result
        });
    }
    /**
     * Authentication event logging
     */
    async logAuthentication(userId, action, result, details) {
        await this.log({
            type: AuditEventType.AUTHENTICATION,
            userId,
            action,
            result,
            details
        });
    }
    /**
     * Data access event logging
     */
    async logDataAccess(userId, resource, action, result, details) {
        await this.log({
            type: AuditEventType.DATA_ACCESS,
            userId,
            resource,
            action,
            result,
            details
        });
    }
    /**
     * Security event logging
     */
    async logSecurityEvent(action, severity, details) {
        await this.log({
            type: AuditEventType.SECURITY_EVENT,
            action,
            result: 'failure',
            details,
            metadata: { severity }
        });
    }
    /**
     * API access logging
     */
    async logApiAccess(userId, endpoint, method, statusCode, responseTime) {
        await this.log({
            type: AuditEventType.API_ACCESS,
            userId,
            action: `${method} ${endpoint}`,
            resource: endpoint,
            result: statusCode < 400 ? 'success' : 'failure',
            details: { statusCode, responseTime }
        });
    }
    /**
     * Flush buffer to file
     */
    async flush() {
        if (this.eventBuffer.length === 0)
            return;
        const events = [...this.eventBuffer];
        this.eventBuffer = [];
        try {
            for (const event of events) {
                const line = JSON.stringify(event) + '\n';
                if (this.fileStream) {
                    this.fileStream.write(line);
                }
            }
            // Check file size
            const stats = fs.statSync(this.currentFile);
            if (stats.size >= this.options.maxFileSize) {
                await this.rotateFile();
            }
        }
        catch (error) {
            logger.error('Error flushing audit buffer:', error);
            // Re-add events to buffer
            this.eventBuffer.unshift(...events);
        }
    }
    /**
     * Rotate log file
     */
    async rotateFile() {
        // Close current stream
        if (this.fileStream) {
            this.fileStream.end();
        }
        // Generate new filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.currentFile = path.join(this.options.logDir, `audit-${timestamp}.log`);
        // Create new stream
        this.fileStream = fs.createWriteStream(this.currentFile, { flags: 'a' });
        // Compress old file if needed
        if (this.options.compressLogs) {
            // Implementation would compress previous file
        }
    }
    /**
     * Query audit logs
     */
    async query(query) {
        const results = [];
        const files = this.getLogFiles();
        for (const file of files) {
            const events = await this.readLogFile(file);
            for (const event of events) {
                if (this.matchesQuery(event, query)) {
                    results.push(event);
                    if (query.limit && results.length >= query.limit) {
                        return results;
                    }
                }
            }
        }
        return results;
    }
    /**
     * Generate audit report
     */
    async generateReport(startDate, endDate) {
        const events = await this.query({ startDate, endDate });
        const report = {
            totalEvents: events.length,
            byType: {},
            byResult: {},
            byUser: {},
            timeline: [],
            topActions: [],
            securityEvents: []
        };
        // Count by type
        for (const event of events) {
            report.byType[event.type] = (report.byType[event.type] || 0) + 1;
            report.byResult[event.result] = (report.byResult[event.result] || 0) + 1;
            if (event.userId) {
                report.byUser[event.userId] = (report.byUser[event.userId] || 0) + 1;
            }
            if (event.type === AuditEventType.SECURITY_EVENT) {
                report.securityEvents.push(event);
            }
        }
        // Generate timeline
        const timelineMap = new Map();
        for (const event of events) {
            const date = event.timestamp.toISOString().split('T')[0];
            timelineMap.set(date, (timelineMap.get(date) || 0) + 1);
        }
        report.timeline = Array.from(timelineMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
        // Top actions
        const actionMap = new Map();
        for (const event of events) {
            actionMap.set(event.action, (actionMap.get(event.action) || 0) + 1);
        }
        report.topActions = Array.from(actionMap.entries())
            .map(([action, count]) => ({ action, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return report;
    }
    /**
     * Export audit logs
     */
    async export(format, query) {
        const events = await this.query(query);
        if (format === 'json') {
            return JSON.stringify(events, null, 2);
        }
        // CSV format
        const headers = [
            'id', 'timestamp', 'type', 'userId', 'action',
            'resource', 'result', 'ipAddress', 'details'
        ];
        const rows = [headers.join(',')];
        for (const event of events) {
            const row = [
                event.id,
                event.timestamp.toISOString(),
                event.type,
                event.userId || '',
                event.action,
                event.resource || '',
                event.result,
                event.ipAddress || '',
                JSON.stringify(event.details || {})
            ];
            rows.push(row.map(v => `"${v}"`).join(','));
        }
        return rows.join('\n');
    }
    /**
     * Verify audit log integrity
     */
    async verifyIntegrity(file) {
        const events = await this.readLogFile(file);
        for (const event of events) {
            const calculatedHash = this.generateHash({ ...event, hash: undefined });
            if (event.hash !== calculatedHash) {
                logger.error('Audit log integrity check failed', {
                    file,
                    eventId: event.id
                });
                return false;
            }
        }
        return true;
    }
    /**
     * Generate event ID
     */
    generateEventId() {
        return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    }
    /**
     * Generate hash for event
     */
    generateHash(event) {
        const data = JSON.stringify({
            ...event,
            hash: undefined
        });
        return crypto
            .createHash(this.options.hashAlgorithm)
            .update(data)
            .digest('hex');
    }
    /**
     * Check if event is critical
     */
    isCriticalEvent(event) {
        return (event.type === AuditEventType.SECURITY_EVENT ||
            (event.type === AuditEventType.AUTHENTICATION && event.result === 'failure') ||
            event.metadata?.severity === 'critical');
    }
    /**
     * Get log files
     */
    getLogFiles() {
        const files = fs.readdirSync(this.options.logDir)
            .filter(f => f.startsWith('audit-') && f.endsWith('.log'))
            .map(f => path.join(this.options.logDir, f))
            .sort((a, b) => b.localeCompare(a)); // Newest first
        return files.slice(0, this.options.maxFiles);
    }
    /**
     * Read log file
     */
    async readLogFile(file) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        return lines.map(line => {
            try {
                const event = JSON.parse(line);
                event.timestamp = new Date(event.timestamp);
                return event;
            }
            catch {
                return null;
            }
        }).filter(Boolean);
    }
    /**
     * Check if event matches query
     */
    matchesQuery(event, query) {
        if (query.startDate && event.timestamp < query.startDate)
            return false;
        if (query.endDate && event.timestamp > query.endDate)
            return false;
        if (query.userId && event.userId !== query.userId)
            return false;
        if (query.type && event.type !== query.type)
            return false;
        if (query.action && event.action !== query.action)
            return false;
        if (query.result && event.result !== query.result)
            return false;
        return true;
    }
    /**
     * Clean up old logs
     */
    cleanupOldLogs() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.options.retentionDays);
        const files = this.getLogFiles();
        for (const file of files) {
            const stats = fs.statSync(file);
            if (stats.mtime < cutoffDate) {
                fs.unlinkSync(file);
                logger.info(`Deleted old audit log: ${file}`);
            }
        }
    }
    /**
     * Create middleware for Express/Koa
     */
    middleware() {
        return async (req, res, next) => {
            const start = Date.now();
            // Capture original end method
            const originalEnd = res.end;
            res.end = async (...args) => {
                const responseTime = Date.now() - start;
                // Log API access
                await this.logApiAccess(req.user?.id || 'anonymous', req.path, req.method, res.statusCode, responseTime);
                // Call original end
                originalEnd.apply(res, args);
            };
            next();
        };
    }
    /**
     * Destroy audit logger
     */
    destroy() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        this.flush();
        if (this.fileStream) {
            this.fileStream.end();
        }
    }
}
// Export singleton instance
export const auditLogger = new AuditLogger();
//# sourceMappingURL=AuditLogger.js.map