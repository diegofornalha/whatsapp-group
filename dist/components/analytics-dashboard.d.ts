/**
 * Analytics Dashboard Component
 * Dashboard interativo com gráficos e métricas em tempo real
 */
import { MCPBrowserClient } from '../mcp-browser-client';
export interface DashboardMetrics {
    totalMembers: number;
    growthRate: number;
    activeGroups: number;
    duplicateRate: number;
    patterns: Array<{
        name: string;
        count: number;
        percentage: number;
    }>;
    predictions: Array<{
        metric: string;
        expected: number;
        confidence: number;
    }>;
    timeline: Array<{
        date: string;
        members: number;
        groups: number;
    }>;
}
export declare class AnalyticsDashboard {
    private container;
    private mcpClient;
    private charts;
    private updateInterval;
    private isMinimized;
    constructor(mcpClient: MCPBrowserClient);
    private createContainer;
    private addStyles;
    private initialize;
    private setupEventListeners;
    private makeDraggable;
    private initializeCharts;
    private refresh;
    private updateMetrics;
    private updateCharts;
    private updatePatterns;
    private updatePredictions;
    private updateElement;
    private switchTab;
    private exportData;
    private showApiConfig;
    private showSettings;
    private showError;
    private toggleMinimize;
    private toggleFullscreen;
    private startAutoUpdate;
    private close;
    show(): void;
    hide(): void;
}
export declare function createAnalyticsDashboard(mcpClient: MCPBrowserClient): AnalyticsDashboard;
//# sourceMappingURL=analytics-dashboard.d.ts.map