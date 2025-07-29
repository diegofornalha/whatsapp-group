import { EventEmitter } from 'events';
export var MetricType;
(function (MetricType) {
    MetricType["COUNTER"] = "counter";
    MetricType["GAUGE"] = "gauge";
    MetricType["HISTOGRAM"] = "histogram";
    MetricType["SUMMARY"] = "summary";
})(MetricType || (MetricType = {}));
class MetricStore {
    constructor() {
        this.metrics = new Map();
        this.definitions = new Map();
    }
    registerMetric(definition) {
        const key = this.getMetricKey(definition.name, definition.labels || []);
        this.definitions.set(key, definition);
    }
    record(metric) {
        const key = this.getMetricKey(metric.name, Object.keys(metric.labels || {}));
        if (!this.metrics.has(key)) {
            this.metrics.set(key, []);
        }
        this.metrics.get(key).push(metric);
    }
    getMetrics(name, labels) {
        if (!name) {
            return Array.from(this.metrics.values()).flat();
        }
        const key = this.getMetricKey(name, Object.keys(labels || {}));
        return this.metrics.get(key) || [];
    }
    clear(olderThan) {
        if (!olderThan) {
            this.metrics.clear();
            return;
        }
        for (const [key, metrics] of this.metrics.entries()) {
            const filtered = metrics.filter(m => m.timestamp > olderThan);
            if (filtered.length === 0) {
                this.metrics.delete(key);
            }
            else {
                this.metrics.set(key, filtered);
            }
        }
    }
    getMetricKey(name, labelKeys) {
        return `${name}:${labelKeys.sort().join(',')}`;
    }
}
export class MetricsCollector extends EventEmitter {
    constructor(config = {}) {
        super();
        this.id = 'metrics-collector';
        this.name = 'Metrics Collector';
        this.version = '1.0.0';
        this.store = new MetricStore();
        this.running = false;
        this.startTime = Date.now();
        this.counters = new Map();
        this.gauges = new Map();
        this.histograms = new Map();
        this.config = {
            collectInterval: 10000, // 10 seconds
            enableSystemMetrics: true,
            enableCustomMetrics: true,
            retentionPeriod: 3600000, // 1 hour
            aggregationInterval: 60000, // 1 minute
            ...config
        };
        this.registerDefaultMetrics();
    }
    registerDefaultMetrics() {
        // System metrics
        this.store.registerMetric({
            name: 'system.cpu.usage',
            type: MetricType.GAUGE,
            description: 'CPU usage percentage',
            unit: 'percent'
        });
        this.store.registerMetric({
            name: 'system.memory.used',
            type: MetricType.GAUGE,
            description: 'Memory usage in bytes',
            unit: 'bytes'
        });
        // Application metrics
        this.store.registerMetric({
            name: 'app.requests.total',
            type: MetricType.COUNTER,
            description: 'Total number of requests',
            labels: ['method', 'status']
        });
        this.store.registerMetric({
            name: 'app.response.time',
            type: MetricType.HISTOGRAM,
            description: 'Response time in milliseconds',
            unit: 'ms',
            buckets: [10, 50, 100, 500, 1000, 5000]
        });
    }
    async initialize() {
        // Initialize metric collection
        this.emit('initialized');
    }
    async start() {
        if (this.running)
            return;
        this.running = true;
        this.startTime = Date.now();
        // Start periodic collection
        this.collectTimer = setInterval(() => this.collect(), this.config.collectInterval);
        // Start cleanup timer
        this.cleanupTimer = setInterval(() => this.cleanup(), this.config.aggregationInterval);
        // Collect initial metrics
        await this.collect();
        this.emit('started');
    }
    async stop() {
        if (!this.running)
            return;
        this.running = false;
        if (this.collectTimer) {
            clearInterval(this.collectTimer);
        }
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.emit('stopped');
    }
    isRunning() {
        return this.running;
    }
    getStatus() {
        return {
            state: this.running ? 'running' : 'stopped',
            uptime: this.running ? Date.now() - this.startTime : 0,
            metadata: {
                metricsCount: this.store.getMetrics().length,
                countersCount: this.counters.size,
                gaugesCount: this.gauges.size
            }
        };
    }
    async healthCheck() {
        const metricsCount = this.store.getMetrics().length;
        return {
            healthy: this.running && metricsCount > 0,
            message: this.running ? 'Collecting metrics' : 'Collector stopped',
            details: {
                metricsCount,
                uptime: Date.now() - this.startTime
            },
            timestamp: new Date()
        };
    }
    // Metric recording methods
    incrementCounter(name, value = 1, labels) {
        const key = this.getCounterKey(name, labels);
        this.counters.set(key, (this.counters.get(key) || 0) + value);
        this.store.record({
            name,
            type: MetricType.COUNTER,
            value: this.counters.get(key),
            labels,
            timestamp: new Date()
        });
        this.emit('metric', { name, type: 'counter', value, labels });
    }
    setGauge(name, value, labels) {
        const key = this.getCounterKey(name, labels);
        this.gauges.set(key, value);
        this.store.record({
            name,
            type: MetricType.GAUGE,
            value,
            labels,
            timestamp: new Date()
        });
        this.emit('metric', { name, type: 'gauge', value, labels });
    }
    recordHistogram(name, value, labels) {
        const key = this.getCounterKey(name, labels);
        if (!this.histograms.has(key)) {
            this.histograms.set(key, []);
        }
        this.histograms.get(key).push(value);
        this.store.record({
            name,
            type: MetricType.HISTOGRAM,
            value,
            labels,
            timestamp: new Date()
        });
        this.emit('metric', { name, type: 'histogram', value, labels });
    }
    // Timer utility
    startTimer(name, labels) {
        const start = Date.now();
        return () => {
            const duration = Date.now() - start;
            this.recordHistogram(name, duration, labels);
        };
    }
    // Collection methods
    async collect() {
        if (this.config.enableSystemMetrics) {
            await this.collectSystemMetrics();
        }
        const snapshot = {
            timestamp: new Date(),
            metrics: this.store.getMetrics(),
            systemMetrics: await this.getSystemMetrics()
        };
        this.emit('snapshot', snapshot);
    }
    async collectSystemMetrics() {
        const metrics = await this.getSystemMetrics();
        this.setGauge('system.cpu.usage', metrics.cpu.usage);
        this.setGauge('system.memory.used', metrics.memory.used);
        this.setGauge('system.memory.heap.used', metrics.memory.heapUsed);
        this.setGauge('process.uptime', metrics.process.uptime);
    }
    async getSystemMetrics() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        return {
            cpu: {
                usage: cpuUsage.user / 1000000, // Convert to seconds
                cores: require('os').cpus().length
            },
            memory: {
                total: require('os').totalmem(),
                free: require('os').freemem(),
                used: require('os').totalmem() - require('os').freemem(),
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external
            },
            process: {
                uptime: process.uptime(),
                pid: process.pid,
                version: process.version
            }
        };
    }
    cleanup() {
        const cutoff = new Date(Date.now() - this.config.retentionPeriod);
        this.store.clear(cutoff);
    }
    getCounterKey(name, labels) {
        if (!labels)
            return name;
        const labelStr = Object.entries(labels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join(',');
        return `${name}{${labelStr}}`;
    }
    // Query methods
    getMetric(name, labels) {
        return this.store.getMetrics(name, labels);
    }
    getSnapshot() {
        return {
            timestamp: new Date(),
            metrics: this.store.getMetrics(),
            systemMetrics: this.getSystemMetrics()
        };
    }
    getAggregatedMetrics(name, aggregation, period) {
        const cutoff = new Date(Date.now() - period);
        const metrics = this.store.getMetrics(name)
            .filter(m => m.timestamp > cutoff)
            .map(m => m.value);
        if (metrics.length === 0)
            return null;
        switch (aggregation) {
            case 'sum':
                return metrics.reduce((a, b) => a + b, 0);
            case 'avg':
                return metrics.reduce((a, b) => a + b, 0) / metrics.length;
            case 'min':
                return Math.min(...metrics);
            case 'max':
                return Math.max(...metrics);
            case 'count':
                return metrics.length;
        }
    }
    getHistogramStats(name, labels) {
        const key = this.getCounterKey(name, labels);
        const values = this.histograms.get(key);
        if (!values || values.length === 0)
            return null;
        const sorted = [...values].sort((a, b) => a - b);
        const count = sorted.length;
        const sum = sorted.reduce((a, b) => a + b, 0);
        return {
            count,
            sum,
            avg: sum / count,
            min: sorted[0],
            max: sorted[count - 1],
            p50: sorted[Math.floor(count * 0.5)],
            p95: sorted[Math.floor(count * 0.95)],
            p99: sorted[Math.floor(count * 0.99)]
        };
    }
    exportMetrics(format = 'json') {
        const metrics = this.store.getMetrics();
        if (format === 'json') {
            return JSON.stringify(metrics, null, 2);
        }
        // Prometheus format
        const lines = [];
        const grouped = new Map();
        for (const metric of metrics) {
            if (!grouped.has(metric.name)) {
                grouped.set(metric.name, []);
            }
            grouped.get(metric.name).push(metric);
        }
        for (const [name, metrics] of grouped) {
            const latest = metrics[metrics.length - 1];
            if (latest.description) {
                lines.push(`# HELP ${name} ${latest.description}`);
            }
            if (latest.type) {
                lines.push(`# TYPE ${name} ${latest.type}`);
            }
            for (const metric of metrics) {
                const labelStr = metric.labels
                    ? `{${Object.entries(metric.labels)
                        .map(([k, v]) => `${k}="${v}"`)
                        .join(',')}}`
                    : '';
                lines.push(`${name}${labelStr} ${metric.value}`);
            }
        }
        return lines.join('\n');
    }
    async dispose() {
        await this.stop();
        this.store.clear();
        this.removeAllListeners();
    }
}
//# sourceMappingURL=MetricsCollector.js.map