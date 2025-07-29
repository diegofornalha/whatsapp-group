/// <reference types="node" />
import { EventEmitter } from 'events';
import { IService, ServiceStatus, HealthCheckResult } from '../types/IService';
export declare enum MetricType {
    COUNTER = "counter",
    GAUGE = "gauge",
    HISTOGRAM = "histogram",
    SUMMARY = "summary"
}
export interface Metric {
    name: string;
    type: MetricType;
    value: number;
    labels?: Record<string, string>;
    timestamp: Date;
    unit?: string;
    description?: string;
}
export interface MetricDefinition {
    name: string;
    type: MetricType;
    description: string;
    unit?: string;
    labels?: string[];
    buckets?: number[];
}
export interface MetricsSnapshot {
    timestamp: Date;
    metrics: Metric[];
    systemMetrics: SystemMetrics;
}
export interface SystemMetrics {
    cpu: {
        usage: number;
        cores: number;
    };
    memory: {
        total: number;
        used: number;
        free: number;
        heapUsed: number;
        heapTotal: number;
        external: number;
    };
    process: {
        uptime: number;
        pid: number;
        version: string;
    };
}
export interface MetricsCollectorConfig {
    collectInterval: number;
    enableSystemMetrics: boolean;
    enableCustomMetrics: boolean;
    retentionPeriod: number;
    aggregationInterval: number;
}
export declare class MetricsCollector extends EventEmitter implements IService {
    readonly id = "metrics-collector";
    readonly name = "Metrics Collector";
    readonly version = "1.0.0";
    private config;
    private store;
    private running;
    private collectTimer?;
    private cleanupTimer?;
    private startTime;
    private counters;
    private gauges;
    private histograms;
    constructor(config?: Partial<MetricsCollectorConfig>);
    private registerDefaultMetrics;
    initialize(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    isRunning(): boolean;
    getStatus(): ServiceStatus;
    healthCheck(): Promise<HealthCheckResult>;
    incrementCounter(name: string, value?: number, labels?: Record<string, string>): void;
    setGauge(name: string, value: number, labels?: Record<string, string>): void;
    recordHistogram(name: string, value: number, labels?: Record<string, string>): void;
    startTimer(name: string, labels?: Record<string, string>): () => void;
    private collect;
    private collectSystemMetrics;
    private getSystemMetrics;
    private cleanup;
    private getCounterKey;
    getMetric(name: string, labels?: Record<string, string>): Metric[];
    getSnapshot(): MetricsSnapshot;
    getAggregatedMetrics(name: string, aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count', period: number): number | null;
    getHistogramStats(name: string, labels?: Record<string, string>): {
        count: number;
        sum: number;
        avg: number;
        min: number;
        max: number;
        p50: number;
        p95: number;
        p99: number;
    } | null;
    exportMetrics(format?: 'json' | 'prometheus'): string;
    dispose(): Promise<void>;
}
//# sourceMappingURL=MetricsCollector.d.ts.map