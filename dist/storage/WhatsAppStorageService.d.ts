/**
 * Storage service for WhatsApp members with persistence and security
 */
import { IStorage, StorageStats } from '../types/IStorage';
import { Member, ExportData } from '../types/models';
import { BaseService } from '../core/BaseService';
import { EventBus } from '../core/EventBus';
import { ILogger } from '../types/ILogger';
import { SecurityManager } from '../core/security/SecurityManager';
export declare class WhatsAppStorageService extends BaseService implements IStorage {
    private securityManager;
    private storage;
    private memberMap;
    constructor(eventBus: EventBus, logger: ILogger, securityManager: SecurityManager);
    addMember(member: Member): Promise<void>;
    getMember(id: string): Promise<Member | null>;
    getAllMembers(): Promise<Member[]>;
    removeMember(id: string): Promise<void>;
    clear(): Promise<void>;
    exportData(format?: 'csv' | 'json'): Promise<ExportData>;
    getStats(): Promise<StorageStats>;
    protected onInitialize(): Promise<void>;
    protected onStart(): Promise<void>;
    protected onStop(): Promise<void>;
    protected onDispose(): Promise<void>;
}
//# sourceMappingURL=WhatsAppStorageService.d.ts.map