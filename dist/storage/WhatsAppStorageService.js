/**
 * Storage service for WhatsApp members with persistence and security
 */
import { BaseService } from '../core/BaseService';
import { ListStorage, exportToCsv } from 'browser-scraping-utils';
export class WhatsAppStorageService extends BaseService {
    constructor(eventBus, logger, securityManager) {
        super('WhatsAppStorageService', eventBus, logger);
        this.securityManager = securityManager;
        this.memberMap = new Map();
        // Initialize browser storage
        this.storage = new ListStorage({
            name: 'whatsapp-scraper'
        });
    }
    async addMember(member) {
        try {
            // Security check
            const securityCheck = await this.securityManager.checkSecurity('storage-add', { member }, { source: 'WhatsAppStorage' });
            if (!securityCheck.allowed) {
                throw new Error(`Security check failed: ${securityCheck.reasons.join(', ')}`);
            }
            // Store in browser storage
            const storedMember = {
                ...member,
                profileId: member.id
            };
            await this.storage.addElem(member.id, storedMember, true // Update if exists
            );
            // Store in memory map
            this.memberMap.set(member.id, member);
            // Emit event
            this.eventBus.emit('storage:member:added', { member });
            this.logger.debug('Member added to storage', {
                id: member.id,
                name: member.name
            });
        }
        catch (error) {
            this.logger.error('Failed to add member', error);
            throw error;
        }
    }
    async getMember(id) {
        try {
            // Try memory first
            const cached = this.memberMap.get(id);
            if (cached) {
                return cached;
            }
            // Try browser storage
            const stored = await this.storage.getElem(id);
            if (stored) {
                const member = {
                    id: stored.id,
                    name: stored.name,
                    phoneNumber: stored.phoneNumber,
                    description: stored.description,
                    extractedAt: stored.extractedAt,
                    source: stored.source
                };
                // Cache in memory
                this.memberMap.set(id, member);
                return member;
            }
            return null;
        }
        catch (error) {
            this.logger.error('Failed to get member', error);
            return null;
        }
    }
    async getAllMembers() {
        try {
            const allMembers = await this.storage.getAll();
            return allMembers.map(stored => ({
                id: stored.id,
                name: stored.name,
                phoneNumber: stored.phoneNumber,
                description: stored.description,
                extractedAt: stored.extractedAt,
                source: stored.source
            }));
        }
        catch (error) {
            this.logger.error('Failed to get all members', error);
            return [];
        }
    }
    async removeMember(id) {
        try {
            await this.storage.deleteElem(id);
            this.memberMap.delete(id);
            this.eventBus.emit('storage:member:removed', { id });
            this.logger.debug('Member removed from storage', { id });
        }
        catch (error) {
            this.logger.error('Failed to remove member', error);
            throw error;
        }
    }
    async clear() {
        try {
            // Security check
            const securityCheck = await this.securityManager.checkSecurity('storage-clear', {}, { source: 'WhatsAppStorage' });
            if (!securityCheck.allowed) {
                throw new Error(`Security check failed: ${securityCheck.reasons.join(', ')}`);
            }
            await this.storage.clear();
            this.memberMap.clear();
            this.eventBus.emit('storage:cleared', {});
            this.logger.info('Storage cleared');
        }
        catch (error) {
            this.logger.error('Failed to clear storage', error);
            throw error;
        }
    }
    async exportData(format = 'csv') {
        try {
            // Security check
            const securityCheck = await this.securityManager.checkSecurity('storage-export', { format }, { source: 'WhatsAppStorage' });
            if (!securityCheck.allowed) {
                throw new Error(`Security check failed: ${securityCheck.reasons.join(', ')}`);
            }
            const members = await this.getAllMembers();
            const timestamp = new Date().toISOString();
            if (format === 'csv') {
                const csvData = await this.storage.toCsvData();
                // Export file
                const filename = `whatsapp-export-${timestamp}.csv`;
                exportToCsv(filename, csvData);
                return {
                    format: 'csv',
                    data: csvData,
                    metadata: {
                        exportedAt: new Date(),
                        totalMembers: members.length,
                        filename
                    }
                };
            }
            else {
                const jsonData = {
                    exportedAt: timestamp,
                    totalMembers: members.length,
                    members
                };
                return {
                    format: 'json',
                    data: JSON.stringify(jsonData, null, 2),
                    metadata: {
                        exportedAt: new Date(),
                        totalMembers: members.length
                    }
                };
            }
        }
        catch (error) {
            this.logger.error('Failed to export data', error);
            throw error;
        }
    }
    async getStats() {
        try {
            const count = await this.storage.getCount();
            const members = await this.getAllMembers();
            const sources = new Set();
            members.forEach(m => {
                if (m.source)
                    sources.add(m.source);
            });
            return {
                totalMembers: count,
                totalGroups: sources.size,
                lastUpdated: new Date()
            };
        }
        catch (error) {
            this.logger.error('Failed to get stats', error);
            return {
                totalMembers: 0,
                totalGroups: 0,
                lastUpdated: new Date()
            };
        }
    }
    async onInitialize() {
        // Load existing data into memory
        const existing = await this.storage.getAll();
        existing.forEach(member => {
            this.memberMap.set(member.id, member);
        });
        this.logger.info('Storage service initialized', {
            existingMembers: existing.length
        });
    }
    async onStart() {
        this.status = ServiceStatus.RUNNING;
        this.logger.info('Storage service started');
    }
    async onStop() {
        // Ensure all data is persisted
        this.logger.info('Storage service stopped');
    }
    async onDispose() {
        this.memberMap.clear();
        this.logger.info('Storage service disposed');
    }
}
//# sourceMappingURL=WhatsAppStorageService.js.map