/// <reference types="node" />
import { EventEmitter } from 'events';
import { MetricsCollector } from './MetricsCollector';
import { Logger } from './Logger';
export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    tags?: Record<string, string>;
}
export interface PerformanceBottleneck {
    type: 'cpu' | 'memory' | 'io' | 'network' | 'custom';
    severity: 'low' | 'medium' | 'high' | 'critical';
    metric: string;
    currentValue: number;
    threshold: number;
    duration: number;
    description: string;
    recommendations: string[];
    timestamp: Date;
}
export interface PerformanceThreshold {
    metric: string;
    threshold: number;
    operator: '>' | '<' | '>=' | '<=' | '==';
    severity: 'low' | 'medium' | 'high' | 'critical';
    sustained?: number;
}
export interface PerformanceProfile {
    name: string;
    startTime: number;
    endTime?: number;
    metrics: Map<string, number[]>;
    markers: PerformanceMarker[];
    bottlenecks: PerformanceBottleneck[];
}
export interface PerformanceMarker {
    name: string;
    timestamp: number;
    metadata?: Record<string, any>;
}
export interface PerformanceMonitorConfig {
    enableProfiling: boolean;
    enableBottleneckDetection: boolean;
    sampleInterval: number;
    bottleneckCheckInterval: number;
    thresholds: PerformanceThreshold[];
    maxProfileDuration: number;
}
export declare class PerformanceMonitor extends EventEmitter {
    private config;
    private metricsCollector;
    private logger;
    private profiles;
    private activeProfile?;
    private bottleneckCheckTimer?;
    private thresholdViolations;
    private performanceObserver?;
    constructor(metricsCollector: MetricsCollector, logger: Logger, config?: Partial<PerformanceMonitorConfig>);
    private getDefaultThresholds;
    private initialize;
    private startBottleneckDetection;
    private setupPerformanceObserver;
    private recordPerformanceEntry;
    startProfile(name: string): void;
    stopProfile(name: string): PerformanceProfile | null;
    addMarker(name: string, metadata?: Record<string, any>): void;
    recordMetric(metricName: string, value: number, unit?: string, tags?: Record<string, string>): void;
    measure<T>(name: string, fn: () => T): T;
    measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T>;
    private checkBottlenecks;
    private checkThreshold;
    private measureEventLoopDelay;
    getProfileAnalysis(profileName: string): any;
    getRecommendations(): string[];
    exportProfile(profileName: string, format?: 'json' | 'csv'): string;
    dispose(): void;
}
//# sourceMappingURL=PerformanceMonitor.d.ts.map