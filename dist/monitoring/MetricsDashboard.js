import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, HardDrive, Clock, AlertTriangle, TrendingUp, TrendingDown, Server, Database } from 'lucide-react';
const MetricCard = ({ title, value, unit, icon, trend, trendValue, status = 'normal' }) => {
    const statusColors = {
        normal: 'bg-green-50 border-green-200',
        warning: 'bg-yellow-50 border-yellow-200',
        critical: 'bg-red-50 border-red-200'
    };
    const trendIcons = {
        up: React.createElement(TrendingUp, { className: "w-4 h-4 text-green-500" }),
        down: React.createElement(TrendingDown, { className: "w-4 h-4 text-red-500" }),
        stable: React.createElement(Activity, { className: "w-4 h-4 text-gray-500" })
    };
    return (React.createElement("div", { className: `p-4 rounded-lg border ${statusColors[status]} transition-colors` },
        React.createElement("div", { className: "flex items-center justify-between mb-2" },
            React.createElement("div", { className: "flex items-center gap-2" },
                icon,
                React.createElement("span", { className: "text-sm font-medium text-gray-700" }, title)),
            trend && (React.createElement("div", { className: "flex items-center gap-1" },
                trendIcons[trend],
                trendValue && (React.createElement("span", { className: "text-xs text-gray-600" }, trendValue))))),
        React.createElement("div", { className: "flex items-baseline gap-1" },
            React.createElement("span", { className: "text-2xl font-bold text-gray-900" }, value),
            unit && React.createElement("span", { className: "text-sm text-gray-600" }, unit))));
};
export const MetricsDashboard = ({ metricsCollector, refreshInterval = 5000, showSystemMetrics = true, showCustomMetrics = true, maxDataPoints = 50 }) => {
    const [snapshot, setSnapshot] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);
    const [bottlenecks, setBottlenecks] = useState([]);
    const [selectedMetric, setSelectedMetric] = useState('cpu.usage');
    const fetchMetrics = useCallback(async () => {
        const newSnapshot = await metricsCollector.getSnapshot();
        setSnapshot(newSnapshot);
        // Update historical data
        setHistoricalData(prev => {
            const newData = [...prev, {
                    timestamp: new Date().toLocaleTimeString(),
                    cpu: newSnapshot.systemMetrics.cpu.usage,
                    memory: (newSnapshot.systemMetrics.memory.used /
                        newSnapshot.systemMetrics.memory.total * 100).toFixed(2),
                    heap: (newSnapshot.systemMetrics.memory.heapUsed /
                        newSnapshot.systemMetrics.memory.heapTotal * 100).toFixed(2),
                    uptime: newSnapshot.systemMetrics.process.uptime
                }];
            // Keep only last N data points
            return newData.slice(-maxDataPoints);
        });
    }, [metricsCollector, maxDataPoints]);
    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, refreshInterval);
        // Subscribe to bottleneck events
        const handleBottlenecks = (detected) => {
            setBottlenecks(detected);
        };
        metricsCollector.on('bottlenecksDetected', handleBottlenecks);
        return () => {
            clearInterval(interval);
            metricsCollector.off('bottlenecksDetected', handleBottlenecks);
        };
    }, [fetchMetrics, refreshInterval, metricsCollector]);
    if (!snapshot) {
        return (React.createElement("div", { className: "p-8 text-center" },
            React.createElement("div", { className: "inline-flex items-center gap-2 text-gray-500" },
                React.createElement("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" }),
                "Loading metrics...")));
    }
    const { systemMetrics } = snapshot;
    const cpuStatus = systemMetrics.cpu.usage > 80 ? 'critical' :
        systemMetrics.cpu.usage > 60 ? 'warning' : 'normal';
    const memoryPercent = (systemMetrics.memory.used / systemMetrics.memory.total * 100).toFixed(1);
    const memoryStatus = Number(memoryPercent) > 90 ? 'critical' :
        Number(memoryPercent) > 70 ? 'warning' : 'normal';
    return (React.createElement("div", { className: "p-6 space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, "Metrics Dashboard"),
            React.createElement("div", { className: "flex items-center gap-2 text-sm text-gray-600" },
                React.createElement(Clock, { className: "w-4 h-4" }),
                "Last updated: ",
                new Date().toLocaleTimeString())),
        showSystemMetrics && (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
            React.createElement(MetricCard, { title: "CPU Usage", value: systemMetrics.cpu.usage.toFixed(1), unit: "%", icon: React.createElement(Cpu, { className: "w-5 h-5 text-blue-600" }), status: cpuStatus, trend: "up", trendValue: "+2.3%" }),
            React.createElement(MetricCard, { title: "Memory Usage", value: memoryPercent, unit: "%", icon: React.createElement(HardDrive, { className: "w-5 h-5 text-purple-600" }), status: memoryStatus, trend: "stable" }),
            React.createElement(MetricCard, { title: "Heap Memory", value: (systemMetrics.memory.heapUsed / 1024 / 1024).toFixed(0), unit: "MB", icon: React.createElement(Database, { className: "w-5 h-5 text-green-600" }), status: "normal" }),
            React.createElement(MetricCard, { title: "Uptime", value: (systemMetrics.process.uptime / 3600).toFixed(1), unit: "hours", icon: React.createElement(Server, { className: "w-5 h-5 text-orange-600" }), status: "normal" }))),
        React.createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6" },
            React.createElement("h3", { className: "text-lg font-semibold mb-4" }, "Performance Trends"),
            React.createElement("div", { className: "h-64" },
                React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
                    React.createElement(LineChart, { data: historicalData },
                        React.createElement(CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(XAxis, { dataKey: "timestamp" }),
                        React.createElement(YAxis, null),
                        React.createElement(Tooltip, null),
                        React.createElement(Legend, null),
                        React.createElement(Line, { type: "monotone", dataKey: "cpu", stroke: "#3B82F6", name: "CPU %", strokeWidth: 2 }),
                        React.createElement(Line, { type: "monotone", dataKey: "memory", stroke: "#8B5CF6", name: "Memory %", strokeWidth: 2 }),
                        React.createElement(Line, { type: "monotone", dataKey: "heap", stroke: "#10B981", name: "Heap %", strokeWidth: 2 }))))),
        bottlenecks.length > 0 && (React.createElement("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4" },
            React.createElement("div", { className: "flex items-center gap-2 mb-3" },
                React.createElement(AlertTriangle, { className: "w-5 h-5 text-red-600" }),
                React.createElement("h3", { className: "text-lg font-semibold text-red-900" }, "Performance Bottlenecks Detected")),
            React.createElement("div", { className: "space-y-2" }, bottlenecks.map((bottleneck, index) => (React.createElement("div", { key: index, className: "bg-white p-3 rounded border border-red-100" },
                React.createElement("div", { className: "flex items-center justify-between mb-1" },
                    React.createElement("span", { className: "font-medium text-red-800" },
                        bottleneck.type.toUpperCase(),
                        " Bottleneck"),
                    React.createElement("span", { className: `px-2 py-1 text-xs rounded ${bottleneck.severity === 'critical' ? 'bg-red-600 text-white' :
                            bottleneck.severity === 'high' ? 'bg-orange-600 text-white' :
                                'bg-yellow-600 text-white'}` }, bottleneck.severity.toUpperCase())),
                React.createElement("p", { className: "text-sm text-gray-700 mb-2" }, bottleneck.description),
                React.createElement("div", { className: "text-xs text-gray-600" },
                    React.createElement("p", { className: "font-medium mb-1" }, "Recommendations:"),
                    React.createElement("ul", { className: "list-disc list-inside space-y-1" }, bottleneck.recommendations.slice(0, 2).map((rec, i) => (React.createElement("li", { key: i }, rec))))))))))),
        showCustomMetrics && snapshot.metrics.length > 0 && (React.createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6" },
            React.createElement("h3", { className: "text-lg font-semibold mb-4" }, "Application Metrics"),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Select Metric"),
                    React.createElement("select", { value: selectedMetric, onChange: (e) => setSelectedMetric(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" }, Array.from(new Set(snapshot.metrics.map(m => m.name))).map(name => (React.createElement("option", { key: name, value: name }, name))))),
                React.createElement("div", { className: "h-48" },
                    React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
                        React.createElement(BarChart, { data: snapshot.metrics
                                .filter(m => m.name === selectedMetric)
                                .slice(-10)
                                .map((m, i) => ({
                                name: `${i}`,
                                value: m.value
                            })) },
                            React.createElement(CartesianGrid, { strokeDasharray: "3 3" }),
                            React.createElement(XAxis, { dataKey: "name" }),
                            React.createElement(YAxis, null),
                            React.createElement(Tooltip, null),
                            React.createElement(Bar, { dataKey: "value", fill: "#3B82F6" }))))))),
        React.createElement("div", { className: "bg-gray-50 rounded-lg p-4" },
            React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center" },
                React.createElement("div", null,
                    React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, systemMetrics.cpu.cores),
                    React.createElement("div", { className: "text-sm text-gray-600" }, "CPU Cores")),
                React.createElement("div", null,
                    React.createElement("div", { className: "text-2xl font-bold text-gray-900" },
                        (systemMetrics.memory.total / 1024 / 1024 / 1024).toFixed(1),
                        "GB"),
                    React.createElement("div", { className: "text-sm text-gray-600" }, "Total Memory")),
                React.createElement("div", null,
                    React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, systemMetrics.process.pid),
                    React.createElement("div", { className: "text-sm text-gray-600" }, "Process ID")),
                React.createElement("div", null,
                    React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, systemMetrics.process.version),
                    React.createElement("div", { className: "text-sm text-gray-600" }, "Node Version"))))));
};
//# sourceMappingURL=MetricsDashboard.js.map