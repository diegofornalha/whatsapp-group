/**
 * Anomaly Detector
 * Detects suspicious patterns and behaviors in system operations
 */
import { logger } from '../../utils/logger';
import { EventEmitter } from 'events';
export class AnomalyDetector extends EventEmitter {
    constructor() {
        super();
        this.patterns = new Map();
        this.statistics = {
            totalDetected: 0,
            bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
            byPattern: {},
            recentEvents: []
        };
        this.maxRecentEvents = 100;
        this.initializeDefaultPatterns();
    }
    /**
     * Initialize default anomaly patterns
     */
    initializeDefaultPatterns() {
        // SQL Injection Pattern
        this.addPattern({
            id: 'sql-injection',
            name: 'SQL Injection Attempt',
            description: 'Detects potential SQL injection patterns',
            detector: (data) => {
                const sqlPatterns = [
                    /(\b(union|select|insert|update|delete|drop|create)\b.*\b(from|where|table|database)\b)/i,
                    /(\'|\"|;|--|\*|\/\*|\*\/|xp_|sp_|exec|execute)/i,
                    /(\b(or|and)\b\s*\d+\s*=\s*\d+)/i
                ];
                const text = JSON.stringify(data).toLowerCase();
                return sqlPatterns.some(pattern => pattern.test(text));
            },
            severity: 'critical',
            actions: [
                { type: 'log' },
                { type: 'alert' },
                { type: 'block' }
            ]
        });
        // XSS Pattern
        this.addPattern({
            id: 'xss-attempt',
            name: 'Cross-Site Scripting Attempt',
            description: 'Detects potential XSS patterns',
            detector: (data) => {
                const xssPatterns = [
                    /<script[^>]*>.*?<\/script>/gi,
                    /<iframe[^>]*>.*?<\/iframe>/gi,
                    /javascript:/gi,
                    /on\w+\s*=\s*["'][^"']*["']/gi
                ];
                const text = JSON.stringify(data);
                return xssPatterns.some(pattern => pattern.test(text));
            },
            severity: 'high',
            actions: [
                { type: 'log' },
                { type: 'alert' },
                { type: 'block' }
            ]
        });
        // Rapid Request Pattern
        this.addPattern({
            id: 'rapid-requests',
            name: 'Rapid Request Pattern',
            description: 'Detects unusually rapid request patterns',
            detector: (data) => {
                if (!data.requestCount || !data.timeWindow)
                    return false;
                const requestsPerSecond = data.requestCount / (data.timeWindow / 1000);
                return requestsPerSecond > 10; // More than 10 requests per second
            },
            severity: 'medium',
            actions: [
                { type: 'log' },
                { type: 'rateLimit' }
            ]
        });
        // Large Payload Pattern
        this.addPattern({
            id: 'large-payload',
            name: 'Unusually Large Payload',
            description: 'Detects payloads exceeding normal size',
            detector: (data) => {
                const size = JSON.stringify(data).length;
                return size > 1024 * 1024; // 1MB
            },
            severity: 'low',
            actions: [
                { type: 'log' }
            ]
        });
        // Path Traversal Pattern
        this.addPattern({
            id: 'path-traversal',
            name: 'Path Traversal Attempt',
            description: 'Detects potential path traversal patterns',
            detector: (data) => {
                const patterns = [
                    /\.\.(\/|\\)/g,
                    /\.\.%2F/gi,
                    /\.\.%5C/gi
                ];
                const text = JSON.stringify(data);
                return patterns.some(pattern => pattern.test(text));
            },
            severity: 'high',
            actions: [
                { type: 'log' },
                { type: 'alert' },
                { type: 'block' }
            ]
        });
        // Command Injection Pattern
        this.addPattern({
            id: 'command-injection',
            name: 'Command Injection Attempt',
            description: 'Detects potential command injection',
            detector: (data) => {
                const patterns = [
                    /[;&|`\$\(\)]/g,
                    /\b(cat|ls|rm|mv|cp|wget|curl|nc|bash|sh)\b/g
                ];
                const text = JSON.stringify(data);
                return patterns.some(pattern => pattern.test(text));
            },
            severity: 'critical',
            actions: [
                { type: 'log' },
                { type: 'alert' },
                { type: 'block' }
            ]
        });
        // Failed Authentication Pattern
        this.addPattern({
            id: 'failed-auth',
            name: 'Multiple Failed Authentications',
            description: 'Detects multiple failed authentication attempts',
            detector: (data) => {
                return data.failedAttempts && data.failedAttempts >= 5;
            },
            severity: 'high',
            actions: [
                { type: 'log' },
                { type: 'alert' },
                { type: 'rateLimit' },
                { type: 'notify' }
            ]
        });
        // Unusual Time Pattern
        this.addPattern({
            id: 'unusual-time',
            name: 'Unusual Time Activity',
            description: 'Detects activity during unusual hours',
            detector: (data) => {
                const hour = new Date().getHours();
                return hour >= 2 && hour <= 5; // 2 AM - 5 AM
            },
            severity: 'low',
            actions: [
                { type: 'log' }
            ]
        });
    }
    /**
     * Add a new anomaly pattern
     */
    addPattern(pattern) {
        this.patterns.set(pattern.id, pattern);
        logger.info(`Anomaly pattern added: ${pattern.name}`, { patternId: pattern.id });
    }
    /**
     * Remove an anomaly pattern
     */
    removePattern(patternId) {
        this.patterns.delete(patternId);
        logger.info(`Anomaly pattern removed: ${patternId}`);
    }
    /**
     * Check data against all patterns
     */
    async check(data, context = {}) {
        const detectedAnomalies = [];
        for (const [id, pattern] of this.patterns) {
            try {
                if (pattern.detector(data)) {
                    const event = {
                        id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        timestamp: new Date(),
                        pattern,
                        data,
                        context,
                        actions: pattern.actions
                    };
                    detectedAnomalies.push(event);
                    this.recordAnomaly(event);
                    await this.executeActions(event);
                }
            }
            catch (error) {
                logger.error(`Error checking pattern ${id}:`, error);
            }
        }
        return detectedAnomalies;
    }
    /**
     * Record anomaly in statistics
     */
    recordAnomaly(event) {
        this.statistics.totalDetected++;
        this.statistics.bySeverity[event.pattern.severity]++;
        if (!this.statistics.byPattern[event.pattern.id]) {
            this.statistics.byPattern[event.pattern.id] = 0;
        }
        this.statistics.byPattern[event.pattern.id]++;
        // Add to recent events
        this.statistics.recentEvents.unshift(event);
        if (this.statistics.recentEvents.length > this.maxRecentEvents) {
            this.statistics.recentEvents.pop();
        }
        // Emit event
        this.emit('anomaly', event);
    }
    /**
     * Execute actions for detected anomaly
     */
    async executeActions(event) {
        for (const action of event.actions) {
            try {
                switch (action.type) {
                    case 'log':
                        logger.warn(`Anomaly detected: ${event.pattern.name}`, {
                            patternId: event.pattern.id,
                            severity: event.pattern.severity,
                            data: event.data
                        });
                        break;
                    case 'alert':
                        this.emit('alert', event);
                        logger.error(`SECURITY ALERT: ${event.pattern.name}`, {
                            patternId: event.pattern.id,
                            severity: event.pattern.severity,
                            context: event.context
                        });
                        break;
                    case 'block':
                        this.emit('block', event);
                        break;
                    case 'rateLimit':
                        this.emit('rateLimit', event);
                        break;
                    case 'notify':
                        this.emit('notify', event);
                        break;
                }
            }
            catch (error) {
                logger.error(`Error executing action ${action.type}:`, error);
            }
        }
    }
    /**
     * Get anomaly statistics
     */
    getStatistics() {
        return { ...this.statistics };
    }
    /**
     * Reset statistics
     */
    resetStatistics() {
        this.statistics = {
            totalDetected: 0,
            bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
            byPattern: {},
            recentEvents: []
        };
    }
    /**
     * Get all patterns
     */
    getPatterns() {
        return Array.from(this.patterns.values());
    }
    /**
     * Get pattern by ID
     */
    getPattern(patternId) {
        return this.patterns.get(patternId);
    }
    /**
     * Enable/disable pattern
     */
    togglePattern(patternId, enabled) {
        const pattern = this.patterns.get(patternId);
        if (pattern) {
            if (enabled) {
                this.patterns.set(patternId, pattern);
            }
            else {
                this.patterns.delete(patternId);
            }
        }
    }
}
// Export singleton instance
export const anomalyDetector = new AnomalyDetector();
//# sourceMappingURL=AnomalyDetector.js.map