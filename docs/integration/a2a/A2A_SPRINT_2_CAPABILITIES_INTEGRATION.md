# 🔧 A2A Protocol - Sprint 2: Capabilities Integration

## 📋 Sprint Overview

**Objetivo**: Implementar as capabilities principais do WhatsApp Scraper no A2A Protocol, integrando com os serviços existentes.

**Duração Estimada**: 2 semanas  
**Prioridade**: 🔴 Crítica  
**Dependências**: Sprint 1 completo  

## 🎯 Objetivos do Sprint

### **Principais Entregas**
- ✅ `extract_group_members` capability
- ✅ `export_group_data` capability  
- ✅ Task lifecycle management completo
- ✅ Integração com extractors e storage existentes
- ✅ Rate limiting por capability
- ✅ Error handling robusto

### **Critérios de Aceitação**
- [ ] Capability `extract_group_members` funcional end-to-end
- [ ] Capability `export_group_data` com múltiplos formatos
- [ ] Tasks executam corretamente e retornam resultados
- [ ] Rate limiting aplicado por capability
- [ ] Errors são tratados e retornados conforme spec
- [ ] Integração com monitoring existente

## 🛠️ Implementação Detalhada

### **Fase 2.1: Task Management System**

#### **Implementação TaskManager.ts**
```typescript
import { injectable, inject } from 'inversify';
import { EventBus } from '../core/EventBus';
import { ILogger } from '../types/ILogger';
import { SecurityManager } from '../core/security/SecurityManager';
import { A2AContext } from '../middleware/A2AAuthMiddleware';

export enum TaskStatus {
  PENDING = 'pending',
  QUEUED = 'queued', 
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

export interface A2ATask {
  id: string;
  capability: string;
  input: any;
  status: TaskStatus;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  created_by: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  estimated_duration?: string;
  progress?: number;
  result?: any;
  artifacts?: TaskArtifact[];
  error?: TaskError;
  context?: any;
}

export interface TaskArtifact {
  id: string;
  type: string;
  url: string;
  size_bytes: number;
  checksum: string;
  expires_at: string;
  metadata?: any;
}

export interface TaskError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

@injectable()
export class TaskManager {
  private tasks = new Map<string, A2ATask>();
  private taskQueue: A2ATask[] = [];
  private processingTasks = new Set<string>();
  private maxConcurrentTasks = 10;

  constructor(
    @inject('ILogger') private logger: ILogger,
    @inject('EventBus') private eventBus: EventBus,
    @inject('SecurityManager') private security: SecurityManager
  ) {
    this.setupEventListeners();
  }

  async createTask(
    capability: string,
    input: any,
    context: A2AContext,
    priority: string = 'normal'
  ): Promise<A2ATask> {
    // Validate capability
    if (!this.isCapabilitySupported(capability)) {
      throw new JsonRpcError(-32020, 'CAPABILITY_NOT_SUPPORTED', {
        capability,
        supported: this.getSupportedCapabilities()
      });
    }

    // Security validation
    await this.validateTaskCreation(capability, input, context);

    // Create task
    const task: A2ATask = {
      id: this.generateTaskId(),
      capability,
      input: this.sanitizeInput(input),
      status: TaskStatus.PENDING,
      created_at: new Date().toISOString(),
      created_by: context.agent_id,
      priority: priority as any,
      estimated_duration: this.getEstimatedDuration(capability),
      progress: 0
    };

    // Store and queue task
    this.tasks.set(task.id, task);
    this.queueTask(task);

    // Emit event
    this.eventBus.emit('a2a:task:created', { task, context });
    this.logger.info('A2A task created', {
      taskId: task.id,
      capability,
      agentId: context.agent_id
    });

    return task;
  }

  async getTask(taskId: string): Promise<A2ATask | null> {
    return this.tasks.get(taskId) || null;
  }

  async cancelTask(taskId: string, reason?: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new JsonRpcError(-32022, 'TASK_NOT_FOUND', { taskId });
    }

    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED) {
      throw new JsonRpcError(-32023, 'TASK_ALREADY_FINISHED', { 
        taskId, 
        status: task.status 
      });
    }

    // Update task status
    task.status = TaskStatus.CANCELLED;
    task.completed_at = new Date().toISOString();
    if (reason) {
      task.context = { ...task.context, cancellation_reason: reason };
    }

    // Remove from processing if running
    this.processingTasks.delete(taskId);

    // Emit event
    this.eventBus.emit('a2a:task:cancelled', { task, reason });
    this.logger.info('A2A task cancelled', { taskId, reason });

    return true;
  }

  async listTasks(filters: any = {}): Promise<A2ATask[]> {
    let tasks = Array.from(this.tasks.values());

    // Apply filters
    if (filters.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    if (filters.capability) {
      tasks = tasks.filter(t => t.capability === filters.capability);
    }
    if (filters.created_by) {
      tasks = tasks.filter(t => t.created_by === filters.created_by);
    }
    if (filters.created_after) {
      tasks = tasks.filter(t => t.created_at >= filters.created_after);
    }

    // Apply pagination
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;

    return tasks
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit);
  }

  private async processTaskQueue(): Promise<void> {
    while (this.taskQueue.length > 0 && 
           this.processingTasks.size < this.maxConcurrentTasks) {
      
      const task = this.taskQueue.shift();
      if (!task) continue;

      this.processingTasks.add(task.id);
      this.executeTask(task).catch(error => {
        this.logger.error('Task execution failed', error, { taskId: task.id });
      });
    }
  }

  private async executeTask(task: A2ATask): Promise<void> {
    try {
      // Update status
      task.status = TaskStatus.RUNNING;
      task.started_at = new Date().toISOString();
      task.progress = 0;

      this.eventBus.emit('a2a:task:started', { task });

      // Execute based on capability
      const executor = this.getCapabilityExecutor(task.capability);
      const result = await executor.execute(task, this.createProgressCallback(task));

      // Complete task
      task.status = TaskStatus.COMPLETED;
      task.completed_at = new Date().toISOString();
      task.progress = 100;
      task.result = result.data;
      task.artifacts = result.artifacts || [];

      this.eventBus.emit('a2a:task:completed', { task });
      this.logger.info('A2A task completed', {
        taskId: task.id,
        duration: this.calculateDuration(task)
      });

    } catch (error) {
      task.status = TaskStatus.FAILED;
      task.completed_at = new Date().toISOString();
      task.error = {
        code: error.code || 'EXECUTION_ERROR',
        message: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      };

      this.eventBus.emit('a2a:task:failed', { task, error });
      this.logger.error('A2A task failed', error, { taskId: task.id });

    } finally {
      this.processingTasks.delete(task.id);
      // Process next task in queue
      setImmediate(() => this.processTaskQueue());
    }
  }

  private createProgressCallback(task: A2ATask): (progress: number, status?: string) => void {
    return (progress: number, status?: string) => {
      task.progress = Math.min(100, Math.max(0, progress));
      if (status) {
        task.context = { ...task.context, current_step: status };
      }
      
      this.eventBus.emit('a2a:task:progress', { 
        taskId: task.id, 
        progress: task.progress,
        status 
      });
    };
  }

  private isCapabilitySupported(capability: string): boolean {
    const supported = ['extract_group_members', 'export_group_data'];
    return supported.includes(capability);
  }

  private getSupportedCapabilities(): string[] {
    return ['extract_group_members', 'export_group_data'];
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private queueTask(task: A2ATask): void {
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Start processing
    setImmediate(() => this.processTaskQueue());
  }
}
```

### **Fase 2.2: Extract Group Members Capability**

#### **Implementação GroupExtractionExecutor.ts**
```typescript
import { injectable, inject } from 'inversify';
import { WhatsAppExtractorService } from '../extractors/WhatsAppExtractorService';
import { WhatsAppStorageService } from '../storage/WhatsAppStorageService';
import { ILogger } from '../types/ILogger';
import { A2ATask } from './TaskManager';

export interface ExtractionResult {
  data: {
    members: any[];
    metadata: any;
    statistics: any;
  };
  artifacts: TaskArtifact[];
}

@injectable()
export class GroupExtractionExecutor {
  constructor(
    @inject('WhatsAppExtractorService') private extractor: WhatsAppExtractorService,
    @inject('WhatsAppStorageService') private storage: WhatsAppStorageService,
    @inject('ILogger') private logger: ILogger
  ) {}

  async execute(
    task: A2ATask, 
    progressCallback: (progress: number, status?: string) => void
  ): Promise<ExtractionResult> {
    const { group_url, filters = {}, export_format = 'json', metadata_level = 'detailed' } = task.input;

    this.logger.info('Starting group extraction', {
      taskId: task.id,
      groupUrl: group_url,
      filters
    });

    progressCallback(10, 'Validating group URL');

    // Validate group URL
    if (!this.isValidGroupUrl(group_url)) {
      throw new Error('Invalid WhatsApp group URL');
    }

    progressCallback(20, 'Initializing extraction');

    // Prepare extraction options
    const extractionOptions = {
      groupUrl: group_url,
      filters: {
        activeOnly: filters.active_only || false,
        phoneNumbersOnly: filters.phone_numbers_only || false,
        excludePatterns: filters.exclude_patterns || [],
        limit: Math.min(filters.limit || 1000, 5000), // Max 5000 members
        dateRange: filters.date_range
      },
      metadataLevel: metadata_level
    };

    progressCallback(30, 'Starting member extraction');

    // Execute extraction using existing service
    const extractionResult = await this.extractor.extractGroupMembers(
      extractionOptions,
      (progress) => {
        // Map extraction progress to 30-80% of total progress
        const totalProgress = 30 + (progress * 0.5);
        progressCallback(totalProgress, 'Extracting member data');
      }
    );

    progressCallback(80, 'Processing extracted data');

    // Process and validate extracted data
    const processedMembers = await this.processExtractedMembers(
      extractionResult.members,
      filters
    );

    progressCallback(90, 'Generating export data');

    // Generate artifacts based on export format
    const artifacts = await this.generateArtifacts(
      processedMembers,
      extractionResult.metadata,
      export_format,
      task.id
    );

    progressCallback(95, 'Storing results');

    // Store results for future reference
    await this.storage.storeExtractionResult({
      taskId: task.id,
      members: processedMembers,
      metadata: extractionResult.metadata,
      extractedAt: new Date()
    });

    progressCallback(100, 'Extraction completed');

    // Prepare final result
    const statistics = this.calculateStatistics(processedMembers, extractionResult);

    return {
      data: {
        members: processedMembers,
        metadata: {
          total_members: processedMembers.length,
          extracted_members: processedMembers.length,
          group_info: extractionResult.groupInfo,
          extraction_timestamp: new Date().toISOString(),
          filters_applied: filters,
          processing_time_ms: this.calculateProcessingTime(task)
        },
        statistics
      },
      artifacts
    };
  }

  private isValidGroupUrl(url: string): boolean {
    const whatsappGroupPattern = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/;
    return whatsappGroupPattern.test(url);
  }

  private async processExtractedMembers(members: any[], filters: any): Promise<any[]> {
    return members.map(member => ({
      id: member.id || this.generateMemberId(member),
      name: this.cleanMemberName(member.name),
      phone_number: member.phoneNumber || null,
      description: this.cleanMemberDescription(member.description),
      profile_picture_url: member.profilePictureUrl || null,
      join_date: member.joinDate || null,
      last_seen: member.lastSeen || null,
      is_admin: member.isAdmin || false,
      is_active: member.isActive !== false, // Default to true
      extraction_timestamp: new Date().toISOString()
    }));
  }

  private async generateArtifacts(
    members: any[],
    metadata: any,
    format: string,
    taskId: string
  ): Promise<TaskArtifact[]> {
    const artifacts: TaskArtifact[] = [];

    switch (format) {
      case 'csv':
        artifacts.push(await this.generateCsvArtifact(members, taskId));
        break;
      case 'excel':
        artifacts.push(await this.generateExcelArtifact(members, taskId));
        break;
      case 'json':
      default:
        artifacts.push(await this.generateJsonArtifact(members, metadata, taskId));
        break;
    }

    return artifacts;
  }

  private async generateJsonArtifact(members: any[], metadata: any, taskId: string): Promise<TaskArtifact> {
    const data = { members, metadata };
    const content = JSON.stringify(data, null, 2);
    const filename = `extraction_${taskId}.json`;
    
    // Store file (implementation depends on storage system)
    const fileUrl = await this.storeArtifactFile(filename, content, 'application/json');
    
    return {
      id: `artifact_${taskId}_json`,
      type: 'json',
      url: fileUrl,
      size_bytes: Buffer.from(content).length,
      checksum: this.calculateChecksum(content),
      expires_at: this.calculateExpiryDate(),
      metadata: {
        format: 'json',
        record_count: members.length
      }
    };
  }

  private async generateCsvArtifact(members: any[], taskId: string): Promise<TaskArtifact> {
    const headers = ['ID', 'Name', 'Phone Number', 'Description', 'Is Admin', 'Is Active', 'Extraction Date'];
    const csvRows = members.map(member => [
      member.id,
      member.name || '',
      member.phone_number || '',
      member.description || '',
      member.is_admin ? 'Yes' : 'No',
      member.is_active ? 'Yes' : 'No',
      member.extraction_timestamp
    ]);

    const csvContent = [headers, ...csvRows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `extraction_${taskId}.csv`;
    const fileUrl = await this.storeArtifactFile(filename, csvContent, 'text/csv');

    return {
      id: `artifact_${taskId}_csv`,
      type: 'csv',
      url: fileUrl,
      size_bytes: Buffer.from(csvContent).length,
      checksum: this.calculateChecksum(csvContent),
      expires_at: this.calculateExpiryDate(),
      metadata: {
        format: 'csv',
        record_count: members.length,
        columns: headers.length
      }
    };
  }

  private calculateStatistics(members: any[], extractionResult: any): any {
    return {
      active_members: members.filter(m => m.is_active).length,
      inactive_members: members.filter(m => !m.is_active).length,
      members_with_phones: members.filter(m => m.phone_number).length,
      admins: members.filter(m => m.is_admin).length,
      extraction_duration_ms: this.calculateProcessingTime({ started_at: extractionResult.startTime }),
      success_rate: 1.0 // 100% success for completed tasks
    };
  }

  // Helper methods
  private generateMemberId(member: any): string {
    return member.phoneNumber || member.name || `member_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  private cleanMemberName(name: string): string {
    return name?.trim().replace(/^~\s*/, '') || '';
  }

  private cleanMemberDescription(description: string): string | null {
    if (!description) return null;
    
    const cleaned = description.trim();
    const ignoredPatterns = [
      /Loading About/i,
      /I am using WhatsApp/i,
      /Available/i
    ];

    if (ignoredPatterns.some(pattern => pattern.test(cleaned))) {
      return null;
    }

    return cleaned;
  }

  private async storeArtifactFile(filename: string, content: string, mimeType: string): Promise<string> {
    // Implementation depends on file storage system (S3, local, etc.)
    // For now, return a mock URL
    return `https://api.whatsapp-scraper.com/artifacts/${filename}`;
  }

  private calculateChecksum(content: string): string {
    // Simple hash for demonstration - use proper crypto in production
    return `sha256:${Buffer.from(content).toString('base64').slice(0, 16)}`;
  }

  private calculateExpiryDate(): string {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // 7 days from now
    return expiry.toISOString();
  }

  private calculateProcessingTime(task: any): number {
    if (!task.started_at) return 0;
    return Date.now() - new Date(task.started_at).getTime();
  }
}
```

### **Fase 2.3: Export Data Capability**

#### **Implementação DataExportExecutor.ts**
```typescript
import { injectable, inject } from 'inversify';
import { WhatsAppStorageService } from '../storage/WhatsAppStorageService';
import { ILogger } from '../types/ILogger';
import { A2ATask } from './TaskManager';

@injectable()
export class DataExportExecutor {
  constructor(
    @inject('WhatsAppStorageService') private storage: WhatsAppStorageService,
    @inject('ILogger') private logger: ILogger
  ) {}

  async execute(
    task: A2ATask,
    progressCallback: (progress: number, status?: string) => void
  ): Promise<ExtractionResult> {
    const { 
      data_source, 
      format, 
      template = 'default',
      customization = {},
      output_options = {}
    } = task.input;

    progressCallback(10, 'Loading data source');

    // Load data from source
    const sourceData = await this.loadDataSource(data_source);

    progressCallback(30, 'Applying customizations');

    // Apply customizations (filtering, field selection, sorting)
    const customizedData = await this.applyCustomizations(sourceData, customization);

    progressCallback(50, 'Generating export');

    // Generate export based on format and template
    const exportResult = await this.generateExport(
      customizedData,
      format,
      template,
      output_options,
      task.id
    );

    progressCallback(90, 'Finalizing export');

    // Prepare artifacts
    const artifacts = await this.createExportArtifacts(exportResult, task.id);

    progressCallback(100, 'Export completed');

    return {
      data: {
        export_result: {
          files: artifacts,
          format,
          template_used: template,
          total_records: customizedData.length,
          total_size_bytes: this.calculateTotalSize(artifacts),
          export_timestamp: new Date().toISOString()
        },
        metadata: {
          processing_time_ms: this.calculateProcessingTime(task),
          compression_ratio: output_options.compression ? 0.3 : 1.0,
          field_mapping: this.getFieldMapping(customization.fields),
          quality_score: this.calculateQualityScore(customizedData)
        }
      },
      artifacts
    };
  }

  private async loadDataSource(dataSource: any): Promise<any[]> {
    if (Array.isArray(dataSource)) {
      // Direct data array
      return dataSource;
    }

    if (typeof dataSource === 'string') {
      // Load by ID (group ID or task ID)
      return await this.storage.loadDataById(dataSource);
    }

    throw new Error('Invalid data source format');
  }

  private async applyCustomizations(data: any[], customization: any): Promise<any[]> {
    let result = [...data];

    // Apply filters
    if (customization.filters) {
      result = this.applyFilters(result, customization.filters);
    }

    // Select specific fields
    if (customization.fields && customization.fields.length > 0) {
      result = this.selectFields(result, customization.fields);
    }

    // Apply sorting
    if (customization.sort_by) {
      result = this.sortData(result, customization.sort_by, customization.sort_order);
    }

    return result;
  }

  private async generateExport(
    data: any[],
    format: string,
    template: string,
    options: any,
    taskId: string
  ): Promise<any> {
    switch (format.toLowerCase()) {
      case 'csv':
        return this.generateCsvExport(data, template, options, taskId);
      case 'json':
        return this.generateJsonExport(data, template, options, taskId);
      case 'excel':
        return this.generateExcelExport(data, template, options, taskId);
      case 'pdf':
        return this.generatePdfExport(data, template, options, taskId);
      case 'xml':
        return this.generateXmlExport(data, template, options, taskId);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private generateCsvExport(data: any[], template: string, options: any, taskId: string): any {
    const templateConfig = this.getTemplateConfig(template, 'csv');
    
    // Generate headers based on template
    const headers = templateConfig.fields;
    
    // Generate CSV content
    const csvRows = data.map(item => 
      headers.map(field => this.formatCsvValue(item[field] || ''))
    );

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    return {
      content: csvContent,
      filename: `export_${taskId}.csv`,
      mimeType: 'text/csv'
    };
  }

  private generateJsonExport(data: any[], template: string, options: any, taskId: string): any {
    const templateConfig = this.getTemplateConfig(template, 'json');
    
    let exportData = data;

    // Apply template transformations
    if (templateConfig.structure === 'nested') {
      exportData = this.createNestedStructure(data);
    }

    const jsonContent = JSON.stringify({
      export_info: {
        generated_at: new Date().toISOString(),
        template: template,
        total_records: data.length
      },
      data: exportData
    }, null, options.pretty_print ? 2 : 0);

    return {
      content: jsonContent,
      filename: `export_${taskId}.json`,
      mimeType: 'application/json'
    };
  }

  private getTemplateConfig(template: string, format: string): any {
    const templates = {
      default: {
        csv: { fields: ['id', 'name', 'phone_number', 'description', 'is_admin'] },
        json: { structure: 'flat' }
      },
      compact: {
        csv: { fields: ['name', 'phone_number'] },
        json: { structure: 'flat' }
      },
      detailed: {
        csv: { fields: ['id', 'name', 'phone_number', 'description', 'is_admin', 'is_active', 'extraction_timestamp'] },
        json: { structure: 'nested' }
      },
      contacts: {
        csv: { fields: ['name', 'phone_number'] },
        json: { structure: 'contacts' }
      }
    };

    return templates[template]?.[format] || templates.default[format];
  }

  // Additional helper methods for other export formats...
  private generateExcelExport(data: any[], template: string, options: any, taskId: string): any {
    // Excel export implementation would go here
    throw new Error('Excel export not implemented yet');
  }

  private generatePdfExport(data: any[], template: string, options: any, taskId: string): any {
    // PDF export implementation would go here  
    throw new Error('PDF export not implemented yet');
  }

  private generateXmlExport(data: any[], template: string, options: any, taskId: string): any {
    // XML export implementation would go here
    throw new Error('XML export not implemented yet');
  }

  // Helper methods
  private formatCsvValue(value: any): string {
    return `"${String(value).replace(/"/g, '""')}"`;
  }

  private applyFilters(data: any[], filters: any): any[] {
    // Implementation for applying filters
    return data; // Placeholder
  }

  private selectFields(data: any[], fields: string[]): any[] {
    return data.map(item => {
      const selected = {};
      fields.forEach(field => {
        if (item.hasOwnProperty(field)) {
          selected[field] = item[field];
        }
      });
      return selected;
    });
  }

  private sortData(data: any[], sortBy: string, order: string = 'asc'): any[] {
    return data.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (order === 'desc') {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });
  }
}
```

### **Fase 2.4: Rate Limiting Integration**

#### **Implementação CapabilityRateLimiter.ts**
```typescript
import { injectable, inject } from 'inversify';
import { SecurityManager } from '../core/security/SecurityManager';
import { ILogger } from '../types/ILogger';
import { A2AContext } from '../middleware/A2AAuthMiddleware';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

@injectable()
export class CapabilityRateLimiter {
  private rateLimitConfigs = {
    extract_group_members: {
      requests_per_minute: 10,
      requests_per_hour: 100,
      concurrent_tasks: 3
    },
    export_group_data: {
      requests_per_minute: 20,
      requests_per_hour: 200,
      concurrent_tasks: 5
    },
    analyze_group_patterns: {
      requests_per_minute: 5,
      requests_per_hour: 50,
      concurrent_tasks: 2
    },
    monitor_group_changes: {
      concurrent_streams: 3,
      max_duration_hours: 24
    }
  };

  constructor(
    @inject('SecurityManager') private security: SecurityManager,
    @inject('ILogger') private logger: ILogger
  ) {}

  async checkRateLimit(
    capability: string,
    context: A2AContext
  ): Promise<RateLimitResult> {
    const config = this.rateLimitConfigs[capability];
    if (!config) {
      return { allowed: true, remaining: 999, resetTime: Date.now() + 60000 };
    }

    // Check minute-based rate limit
    const minuteKey = `a2a:${context.agent_id}:${capability}:minute`;
    const minuteResult = await this.security.rateLimiter.checkLimit(minuteKey, {
      window: 60000, // 1 minute
      max: config.requests_per_minute
    });

    if (!minuteResult.allowed) {
      this.logger.warn('A2A rate limit exceeded (minute)', {
        agentId: context.agent_id,
        capability,
        limit: config.requests_per_minute
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: minuteResult.resetTime,
        retryAfter: 60
      };
    }

    // Check hour-based rate limit
    if (config.requests_per_hour) {
      const hourKey = `a2a:${context.agent_id}:${capability}:hour`;
      const hourResult = await this.security.rateLimiter.checkLimit(hourKey, {
        window: 3600000, // 1 hour
        max: config.requests_per_hour
      });

      if (!hourResult.allowed) {
        this.logger.warn('A2A rate limit exceeded (hour)', {
          agentId: context.agent_id,
          capability,
          limit: config.requests_per_hour
        });

        return {
          allowed: false,
          remaining: 0,
          resetTime: hourResult.resetTime,
          retryAfter: 3600
        };
      }
    }

    // Check concurrent tasks limit
    if (config.concurrent_tasks) {
      const concurrentCount = await this.getCurrentConcurrentTasks(
        context.agent_id,
        capability
      );

      if (concurrentCount >= config.concurrent_tasks) {
        this.logger.warn('A2A concurrent limit exceeded', {
          agentId: context.agent_id,
          capability,
          current: concurrentCount,
          limit: config.concurrent_tasks
        });

        return {
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + 300000, // 5 minutes
          retryAfter: 300
        };
      }
    }

    return {
      allowed: true,
      remaining: Math.min(
        config.requests_per_minute - minuteResult.count,
        config.requests_per_hour ? config.requests_per_hour - (await this.getHourlyCount(context.agent_id, capability)) : 999
      ),
      resetTime: minuteResult.resetTime
    };
  }

  private async getCurrentConcurrentTasks(agentId: string, capability: string): Promise<number> {
    // Implementation would check task manager for running tasks
    // For now, return 0
    return 0;
  }

  private async getHourlyCount(agentId: string, capability: string): Promise<number> {
    // Implementation would get hourly count from rate limiter
    // For now, return 0
    return 0;
  }
}
```

## 🧪 Testing Sprint 2

### **Testes de Capabilities**
```typescript
// test/a2a/sprint2/Capabilities.test.ts
describe('A2A Capabilities - Sprint 2', () => {
  let taskManager: TaskManager;
  let server: A2AServer;

  beforeEach(async () => {
    const container = await createTestContainer();
    taskManager = container.resolve(TOKENS.A2ATaskManager);
    server = container.resolve(TOKENS.A2AServer);
    await server.start(3002);
  });

  describe('Extract Group Members', () => {
    it('should create and execute extraction task', async () => {
      const response = await fetch('http://localhost:3002/a2a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_JWT_TOKEN}`
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'createTask',
          params: {
            capability: 'extract_group_members',
            input: {
              group_url: 'https://chat.whatsapp.com/TEST123',
              filters: { active_only: true, limit: 10 },
              export_format: 'json'
            }
          },
          id: 1
        })
      });

      const result = await response.json();
      
      expect(result.result.task.capability).toBe('extract_group_members');
      expect(result.result.task.status).toBe('pending');

      // Wait for completion
      await waitForTaskCompletion(result.result.task.id, 30000);

      // Check task status
      const statusResponse = await fetch('http://localhost:3002/a2a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_JWT_TOKEN}`
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'getTaskStatus',
          params: { task_id: result.result.task.id },
          id: 2
        })
      });

      const statusResult = await statusResponse.json();
      expect(statusResult.result.task.status).toBe('completed');
      expect(statusResult.result.task.artifacts).toHaveLength(1);
    });
  });

  describe('Export Data', () => {
    it('should export data in different formats', async () => {
      const formats = ['json', 'csv'];
      
      for (const format of formats) {
        const response = await fetch('http://localhost:3002/a2a', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_JWT_TOKEN}`
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'createTask',
            params: {
              capability: 'export_group_data',
              input: {
                data_source: MOCK_MEMBER_DATA,
                format,
                template: 'default'
              }
            },
            id: 3
          })
        });

        const result = await response.json();
        expect(result.result.task.capability).toBe('export_group_data');
        
        await waitForTaskCompletion(result.result.task.id, 10000);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits per capability', async () => {
      // Create multiple tasks rapidly
      const promises = Array.from({ length: 15 }, (_, i) =>
        fetch('http://localhost:3002/a2a', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_JWT_TOKEN}`
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'createTask',
            params: {
              capability: 'extract_group_members',
              input: { group_url: 'https://chat.whatsapp.com/TEST123' }
            },
            id: i
          })
        }).then(r => r.json())
      );

      const results = await Promise.all(promises);
      
      // Should have some rate limit errors
      const rateLimitErrors = results.filter(r => 
        r.error && r.error.code === -32010
      );
      
      expect(rateLimitErrors.length).toBeGreaterThan(0);
    });
  });
});
```

## 📊 Métricas Sprint 2

### **Objetivos de Performance**
- ⚡ Criação de task: < 500ms
- 🔄 Execução de extraction: < 30s para 100 membros
- 📊 Export generation: < 5s para 1000 registros
- 🔒 Rate limit check: < 10ms

### **Funcionalidades Entregues**
- ✅ 2 capabilities funcionais
- ✅ Task lifecycle completo
- ✅ Rate limiting por capability
- ✅ Export em múltiplos formatos
- ✅ Integração com serviços existentes

---

**Próximo Sprint**: [Sprint 3 - Advanced Features & Streaming](./A2A_SPRINT_3_ADVANCED_FEATURES.md)

**Status**: 📋 **Pronto para Implementação**