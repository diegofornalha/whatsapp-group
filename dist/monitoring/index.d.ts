/**
 * Monitoring Module
 *
 * Provides comprehensive logging, metrics collection, and performance monitoring
 * for the WhatsApp Group Scraper application.
 */
export { Logger, LogLevel, LogEntry, ContextualLogger } from './Logger';
export type { LoggerConfig } from './Logger';
export { MetricsCollector, MetricType, Metric } from './MetricsCollector';
export type { MetricDefinition, MetricsSnapshot, SystemMetrics, MetricsCollectorConfig } from './MetricsCollector';
export { PerformanceMonitor } from './PerformanceMonitor';
export type { PerformanceMetric, PerformanceBottleneck, PerformanceThreshold, PerformanceProfile, PerformanceMonitorConfig } from './PerformanceMonitor';
export { MetricsDashboard } from './MetricsDashboard';
export { LogViewer } from './LogViewer';
export declare function createMonitoringSystem(config?: {
    logger?: Partial<import('./Logger').LoggerConfig>;
    metrics?: Partial<import('./MetricsCollector').MetricsCollectorConfig>;
    performance?: Partial<import('./PerformanceMonitor').PerformanceMonitorConfig>;
}): {
    logger: any;
    metricsCollector: any;
    performanceMonitor: any;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    createContextLogger(context: string): any;
    startPerformanceProfile(name: string): void;
    measurePerformance<T>(name: string, fn: () => T): T;
    measurePerformanceAsync<T_1>(name: string, fn: () => Promise<T_1>): Promise<T_1>;
};
export type MonitoringSystem = ReturnType<typeof createMonitoringSystem>;
//# sourceMappingURL=index.d.ts.map