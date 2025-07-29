/**
 * UI Service for WhatsApp Group Scraper with enhanced interface
 */
import { BaseService } from '../core/BaseService';
import { EventBus } from '../core/EventBus';
import { ILogger } from '../types/ILogger';
import { IStorage } from '../types/IStorage';
import { MetricsCollector } from '../monitoring/MetricsCollector';
import { ConfigService } from '../core/ConfigService';
export declare class UIService extends BaseService {
    private storage;
    private metricsCollector;
    private config;
    private uiContainer;
    private historyTracker;
    private updateInterval?;
    private counterId;
    private performanceId;
    constructor(eventBus: EventBus, logger: ILogger, storage: IStorage, metricsCollector: MetricsCollector, config: ConfigService);
    render(): Promise<void>;
    private buildUI;
    private handleExport;
    private handleReset;
    private showSettings;
    private updateCounter;
    private updatePerformance;
    private startUpdates;
    private applyEnhancedStyles;
    protected onInitialize(): Promise<void>;
    protected onStart(): Promise<void>;
    protected onStop(): Promise<void>;
    protected onDispose(): Promise<void>;
}
//# sourceMappingURL=UIService.d.ts.map