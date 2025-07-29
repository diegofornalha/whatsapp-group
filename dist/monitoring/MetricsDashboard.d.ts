import React from 'react';
import { MetricsCollector } from './MetricsCollector';
interface MetricsDashboardProps {
    metricsCollector: MetricsCollector;
    refreshInterval?: number;
    showSystemMetrics?: boolean;
    showCustomMetrics?: boolean;
    maxDataPoints?: number;
}
export declare const MetricsDashboard: React.FC<MetricsDashboardProps>;
export {};
//# sourceMappingURL=MetricsDashboard.d.ts.map