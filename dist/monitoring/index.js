/**
 * Monitoring Module
 *
 * Provides comprehensive logging, metrics collection, and performance monitoring
 * for the WhatsApp Group Scraper application.
 */
// Core monitoring components
export { Logger, LogLevel, ContextualLogger } from './Logger';
export { MetricsCollector, MetricType } from './MetricsCollector';
export { PerformanceMonitor } from './PerformanceMonitor';
// UI components
export { MetricsDashboard } from './MetricsDashboard';
export { LogViewer } from './LogViewer';
// Factory function to create a fully configured monitoring system
export function createMonitoringSystem(config) {
    const logger = Logger.getInstance(config?.logger);
    const metricsCollector = new MetricsCollector(config?.metrics);
    const performanceMonitor = new PerformanceMonitor(metricsCollector, logger, config?.performance);
    return {
        logger,
        metricsCollector,
        performanceMonitor,
        // Helper methods
        async initialize() {
            await logger.initialize();
            await metricsCollector.initialize();
            await metricsCollector.start();
        },
        async shutdown() {
            await metricsCollector.stop();
            await metricsCollector.dispose();
            performanceMonitor.dispose();
            await logger.dispose();
        },
        // Convenience methods
        createContextLogger(context) {
            return logger.createContext(context);
        },
        startPerformanceProfile(name) {
            performanceMonitor.startProfile(name);
        },
        measurePerformance(name, fn) {
            return performanceMonitor.measure(name, fn);
        },
        async measurePerformanceAsync(name, fn) {
            return performanceMonitor.measureAsync(name, fn);
        }
    };
}
//# sourceMappingURL=index.js.map