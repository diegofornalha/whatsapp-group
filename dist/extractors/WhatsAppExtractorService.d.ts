/**
 * WhatsApp data extraction service with enhanced security and monitoring
 */
import { IExtractor, ExtractionOptions } from '../types/IExtractor';
import { IStorage } from '../types/IStorage';
import { ILogger } from '../types/ILogger';
import { Member } from '../types/models';
import { BaseService } from '../core/BaseService';
import { EventBus } from '../core/EventBus';
import { SecurityManager } from '../core/security/SecurityManager';
import { MetricsCollector } from '../monitoring/MetricsCollector';
export declare class WhatsAppExtractorService extends BaseService implements IExtractor {
    private securityManager;
    private storage;
    private metricsCollector;
    private modalObserver;
    private extractionInProgress;
    private extractedCount;
    constructor(eventBus: EventBus, logger: ILogger, securityManager: SecurityManager, storage: IStorage, metricsCollector: MetricsCollector);
    startExtraction(options: ExtractionOptions): Promise<void>;
    stopExtraction(): Promise<void>;
    extractMember(element: HTMLElement): Promise<Member | null>;
    private monitorModal;
    private parseMemberElement;
    private cleanName;
    private cleanDescription;
    private getCurrentGroupName;
    protected onInitialize(): Promise<void>;
    protected onStart(): Promise<void>;
    protected onStop(): Promise<void>;
    protected onDispose(): Promise<void>;
}
//# sourceMappingURL=WhatsAppExtractorService.d.ts.map