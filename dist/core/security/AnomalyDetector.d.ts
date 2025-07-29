/**
 * Anomaly Detector
 * Detects suspicious patterns and behaviors in system operations
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
export interface AnomalyPattern {
    id: string;
    name: string;
    description: string;
    detector: (data: any) => boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    actions: AnomalyAction[];
}
export interface AnomalyAction {
    type: 'log' | 'alert' | 'block' | 'rateLimit' | 'notify';
    metadata?: any;
}
export interface AnomalyEvent {
    id: string;
    timestamp: Date;
    pattern: AnomalyPattern;
    data: any;
    context: any;
    actions: AnomalyAction[];
}
export interface AnomalyStatistics {
    totalDetected: number;
    bySeverity: Record<string, number>;
    byPattern: Record<string, number>;
    recentEvents: AnomalyEvent[];
}
export declare class AnomalyDetector extends EventEmitter {
    private patterns;
    private statistics;
    private maxRecentEvents;
    constructor();
    /**
     * Initialize default anomaly patterns
     */
    private initializeDefaultPatterns;
    /**
     * Add a new anomaly pattern
     */
    addPattern(pattern: AnomalyPattern): void;
    /**
     * Remove an anomaly pattern
     */
    removePattern(patternId: string): void;
    /**
     * Check data against all patterns
     */
    check(data: any, context?: any): Promise<AnomalyEvent[]>;
    /**
     * Record anomaly in statistics
     */
    private recordAnomaly;
    /**
     * Execute actions for detected anomaly
     */
    private executeActions;
    /**
     * Get anomaly statistics
     */
    getStatistics(): AnomalyStatistics;
    /**
     * Reset statistics
     */
    resetStatistics(): void;
    /**
     * Get all patterns
     */
    getPatterns(): AnomalyPattern[];
    /**
     * Get pattern by ID
     */
    getPattern(patternId: string): AnomalyPattern | undefined;
    /**
     * Enable/disable pattern
     */
    togglePattern(patternId: string, enabled: boolean): void;
}
export declare const anomalyDetector: AnomalyDetector;
//# sourceMappingURL=AnomalyDetector.d.ts.map