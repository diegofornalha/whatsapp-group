import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, Download, RefreshCw, AlertCircle, Info, AlertTriangle, XCircle, ChevronDown, ChevronRight, FileText, Copy, Trash2 } from 'lucide-react';
import { LogLevel } from './Logger';
const LogLevelIcon = ({ level }) => {
    switch (level) {
        case LogLevel.DEBUG:
            return React.createElement(FileText, { className: "w-4 h-4 text-gray-500" });
        case LogLevel.INFO:
            return React.createElement(Info, { className: "w-4 h-4 text-blue-500" });
        case LogLevel.WARN:
            return React.createElement(AlertTriangle, { className: "w-4 h-4 text-yellow-500" });
        case LogLevel.ERROR:
            return React.createElement(XCircle, { className: "w-4 h-4 text-red-500" });
        case LogLevel.CRITICAL:
            return React.createElement(AlertCircle, { className: "w-4 h-4 text-red-700" });
    }
};
const LogEntryRow = ({ entry, expanded, onToggle }) => {
    const levelColors = {
        [LogLevel.DEBUG]: 'bg-gray-50 hover:bg-gray-100',
        [LogLevel.INFO]: 'bg-blue-50 hover:bg-blue-100',
        [LogLevel.WARN]: 'bg-yellow-50 hover:bg-yellow-100',
        [LogLevel.ERROR]: 'bg-red-50 hover:bg-red-100',
        [LogLevel.CRITICAL]: 'bg-red-100 hover:bg-red-200'
    };
    const handleCopy = () => {
        const logText = JSON.stringify(entry, null, 2);
        navigator.clipboard.writeText(logText);
    };
    return (React.createElement("div", { className: `${levelColors[entry.level]} transition-colors` },
        React.createElement("div", { className: "px-4 py-2 cursor-pointer", onClick: onToggle },
            React.createElement("div", { className: "flex items-start gap-3" },
                React.createElement("div", { className: "mt-0.5" }, expanded ?
                    React.createElement(ChevronDown, { className: "w-4 h-4 text-gray-400" }) :
                    React.createElement(ChevronRight, { className: "w-4 h-4 text-gray-400" })),
                React.createElement(LogLevelIcon, { level: entry.level }),
                React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement("div", { className: "flex items-center gap-4 text-sm" },
                        React.createElement("span", { className: "text-gray-600" }, entry.timestamp.toLocaleTimeString()),
                        entry.context && (React.createElement("span", { className: "px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs" }, entry.context)),
                        entry.correlationId && (React.createElement("span", { className: "text-xs text-gray-500" },
                            "ID: ",
                            entry.correlationId))),
                    React.createElement("p", { className: "text-gray-900 mt-1 break-words" }, entry.message),
                    entry.error && !expanded && (React.createElement("p", { className: "text-red-600 text-sm mt-1" },
                        "Error: ",
                        entry.error.message))),
                React.createElement("button", { onClick: (e) => {
                        e.stopPropagation();
                        handleCopy();
                    }, className: "p-1.5 hover:bg-white rounded transition-colors", title: "Copy log entry" },
                    React.createElement(Copy, { className: "w-4 h-4 text-gray-500" })))),
        expanded && (React.createElement("div", { className: "px-4 pb-3 pl-14 space-y-3 border-t border-gray-200/50" },
            entry.metadata && (React.createElement("div", null,
                React.createElement("h4", { className: "text-sm font-medium text-gray-700 mb-1" }, "Metadata"),
                React.createElement("pre", { className: "text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto" }, JSON.stringify(entry.metadata, null, 2)))),
            entry.error && (React.createElement("div", null,
                React.createElement("h4", { className: "text-sm font-medium text-red-700 mb-1" }, "Error Details"),
                React.createElement("div", { className: "bg-white p-2 rounded border border-red-200" },
                    React.createElement("p", { className: "text-sm text-red-600" }, entry.error.message),
                    entry.error.stack && (React.createElement("pre", { className: "text-xs text-gray-600 mt-2 overflow-x-auto" }, entry.error.stack))))),
            entry.source && (React.createElement("div", { className: "text-xs text-gray-500" },
                "Source: ",
                entry.source))))));
};
export const LogViewer = ({ logger, maxLogs = 1000, autoScroll = true, showSearch = true, showFilters = true, refreshInterval = 1000 }) => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [expandedLogs, setExpandedLogs] = useState(new Set());
    const [filter, setFilter] = useState({
        levels: [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL],
        searchTerm: ''
    });
    const [isLive, setIsLive] = useState(true);
    const scrollRef = useRef(null);
    const fetchLogs = useCallback(async () => {
        const recentLogs = await logger.getRecentLogs(maxLogs);
        setLogs(recentLogs);
    }, [logger, maxLogs]);
    useEffect(() => {
        // Initial fetch
        fetchLogs();
        // Set up live updates
        const handleNewLog = (entry) => {
            if (isLive) {
                setLogs(prev => [...prev.slice(-(maxLogs - 1)), entry]);
            }
        };
        logger.on('log', handleNewLog);
        // Periodic refresh if not live
        let interval = null;
        if (!isLive && refreshInterval > 0) {
            interval = setInterval(fetchLogs, refreshInterval);
        }
        return () => {
            logger.off('log', handleNewLog);
            if (interval)
                clearInterval(interval);
        };
    }, [logger, isLive, fetchLogs, maxLogs, refreshInterval]);
    useEffect(() => {
        // Apply filters
        let filtered = logs;
        // Level filter
        filtered = filtered.filter(log => filter.levels.includes(log.level));
        // Search filter
        if (filter.searchTerm) {
            const term = filter.searchTerm.toLowerCase();
            filtered = filtered.filter(log => log.message.toLowerCase().includes(term) ||
                log.context?.toLowerCase().includes(term) ||
                JSON.stringify(log.metadata).toLowerCase().includes(term));
        }
        // Context filter
        if (filter.context) {
            filtered = filtered.filter(log => log.context?.toLowerCase().includes(filter.context.toLowerCase()));
        }
        // Time filter
        if (filter.startTime) {
            filtered = filtered.filter(log => log.timestamp >= filter.startTime);
        }
        if (filter.endTime) {
            filtered = filtered.filter(log => log.timestamp <= filter.endTime);
        }
        setFilteredLogs(filtered);
    }, [logs, filter]);
    useEffect(() => {
        // Auto-scroll
        if (autoScroll && isLive && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [filteredLogs, autoScroll, isLive]);
    const toggleExpanded = (index) => {
        setExpandedLogs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            }
            else {
                newSet.add(index);
            }
            return newSet;
        });
    };
    const clearLogs = () => {
        setLogs([]);
        setExpandedLogs(new Set());
    };
    const exportLogs = () => {
        const dataStr = JSON.stringify(filteredLogs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `logs-${new Date().toISOString()}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    const levelStats = logs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
    }, {});
    return (React.createElement("div", { className: "flex flex-col h-full bg-gray-50" },
        React.createElement("div", { className: "bg-white border-b border-gray-200 p-4" },
            React.createElement("div", { className: "flex items-center justify-between mb-4" },
                React.createElement("h2", { className: "text-xl font-bold text-gray-900" }, "Log Viewer"),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("button", { onClick: () => setIsLive(!isLive), className: `px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors ${isLive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}` },
                        React.createElement(RefreshCw, { className: `w-4 h-4 ${isLive ? 'animate-spin' : ''}` }),
                        isLive ? 'Live' : 'Paused'),
                    React.createElement("button", { onClick: exportLogs, className: "px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors", title: "Export logs" },
                        React.createElement(Download, { className: "w-4 h-4" })),
                    React.createElement("button", { onClick: clearLogs, className: "px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors", title: "Clear logs" },
                        React.createElement(Trash2, { className: "w-4 h-4" })))),
            (showSearch || showFilters) && (React.createElement("div", { className: "space-y-3" },
                showSearch && (React.createElement("div", { className: "relative" },
                    React.createElement(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }),
                    React.createElement("input", { type: "text", placeholder: "Search logs...", value: filter.searchTerm, onChange: (e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value })), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }))),
                showFilters && (React.createElement("div", { className: "flex items-center gap-4" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(Filter, { className: "w-4 h-4 text-gray-500" }),
                        React.createElement("span", { className: "text-sm font-medium text-gray-700" }, "Levels:"),
                        React.createElement("div", { className: "flex gap-1" }, [
                            { level: LogLevel.DEBUG, label: 'D', color: 'gray' },
                            { level: LogLevel.INFO, label: 'I', color: 'blue' },
                            { level: LogLevel.WARN, label: 'W', color: 'yellow' },
                            { level: LogLevel.ERROR, label: 'E', color: 'red' },
                            { level: LogLevel.CRITICAL, label: 'C', color: 'purple' }
                        ].map(({ level, label, color }) => (React.createElement("button", { key: level, onClick: () => {
                                setFilter(prev => ({
                                    ...prev,
                                    levels: prev.levels.includes(level)
                                        ? prev.levels.filter(l => l !== level)
                                        : [...prev.levels, level]
                                }));
                            }, className: `px-2 py-1 text-xs font-medium rounded transition-colors ${filter.levels.includes(level)
                                ? `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}` }, label))))),
                    React.createElement("input", { type: "text", placeholder: "Filter by context...", value: filter.context || '', onChange: (e) => setFilter(prev => ({ ...prev, context: e.target.value })), className: "flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" }))))),
            React.createElement("div", { className: "flex items-center gap-4 mt-3 text-xs text-gray-600" },
                React.createElement("span", null,
                    "Total: ",
                    logs.length),
                React.createElement("span", null,
                    "Filtered: ",
                    filteredLogs.length),
                Object.entries(levelStats).map(([level, count]) => (React.createElement("span", { key: level },
                    LogLevel[Number(level)],
                    ": ",
                    count))))),
        React.createElement("div", { ref: scrollRef, className: "flex-1 overflow-y-auto" }, filteredLogs.length === 0 ? (React.createElement("div", { className: "p-8 text-center text-gray-500" }, filter.searchTerm || filter.context || filter.levels.length < 5
            ? 'No logs match the current filters'
            : 'No logs to display')) : (React.createElement("div", { className: "divide-y divide-gray-200" }, filteredLogs.map((log, index) => (React.createElement(LogEntryRow, { key: index, entry: log, expanded: expandedLogs.has(index), onToggle: () => toggleExpanded(index) }))))))));
};
//# sourceMappingURL=LogViewer.js.map