# 🚀 A2A Protocol - Sprint 3: Advanced Features & Streaming

## 📋 Sprint Overview

**Objetivo**: Implementar recursos avançados incluindo análise de padrões, monitoramento em tempo real com streaming e otimizações de performance.

**Duração Estimada**: 2 semanas  
**Prioridade**: 🟡 Alta  
**Dependências**: Sprint 2 completo  

## 🎯 Objetivos do Sprint

### **Principais Entregas**
- ✅ `analyze_group_patterns` capability
- ✅ `monitor_group_changes` capability com streaming
- ✅ WebSocket support para real-time
- ✅ Performance optimization e caching
- ✅ Advanced error handling e recovery
- ✅ Monitoring e metrics integration

### **Critérios de Aceitação**
- [ ] Group analysis capability funcional com insights
- [ ] Real-time monitoring com WebSocket streaming
- [ ] Performance otimizada com caching
- [ ] Error recovery robusto
- [ ] Metrics integration completa
- [ ] WebSocket connections estáveis

## 🛠️ Implementação Detalhada

### **Fase 3.1: Group Analysis Capability**

#### **Implementação GroupAnalysisExecutor.ts**
```typescript
import { injectable, inject } from 'inversify';
import { ILogger } from '../types/ILogger';
import { A2ATask } from './TaskManager';

export interface AnalysisInsight {
  category: string;
  insight: string;
  confidence: number; // 0-1
  supporting_data: any;
}

export interface AnalysisMetrics {
  engagement_score: number;
  activity_level: 'low' | 'medium' | 'high' | 'very_high';
  growth_rate: number;
  member_retention: number;
}

@injectable()
export class GroupAnalysisExecutor {
  constructor(
    @inject('ILogger') private logger: ILogger
  ) {}

  async execute(
    task: A2ATask,
    progressCallback: (progress: number, status?: string) => void
  ): Promise<any> {
    const { 
      data_source, 
      analysis_type, 
      time_period, 
      analysis_depth = 'standard',
      custom_parameters = {}
    } = task.input;

    this.logger.info('Starting group analysis', {
      taskId: task.id,
      analysisType: analysis_type,
      depth: analysis_depth
    });

    progressCallback(10, 'Loading group data');

    // Load and validate data
    const groupData = await this.loadGroupData(data_source);
    
    progressCallback(20, 'Preprocessing data');

    // Preprocess data for analysis
    const processedData = await this.preprocessData(groupData, time_period);

    progressCallback(40, `Performing ${analysis_type} analysis`);

    // Perform specific analysis
    const analysisResults = await this.performAnalysis(
      processedData,
      analysis_type,
      analysis_depth,
      custom_parameters,
      (progress) => {
        progressCallback(40 + (progress * 0.4), `Analyzing ${analysis_type} patterns`);
      }
    );

    progressCallback(80, 'Generating insights');

    // Generate insights and recommendations
    const insights = await this.generateInsights(analysisResults, analysis_type);
    const recommendations = await this.generateRecommendations(analysisResults, analysis_type);

    progressCallback(90, 'Creating visualizations');

    // Generate visualizations
    const visualizations = await this.generateVisualizations(analysisResults, analysis_type);

    progressCallback(100, 'Analysis completed');

    return {
      data: {
        analysis_results: {
          analysis_type,
          insights,
          metrics: this.calculateMetrics(analysisResults),
          recommendations,
          risk_factors: this.identifyRiskFactors(analysisResults)
        },
        visualizations
      },
      artifacts: await this.generateAnalysisArtifacts(analysisResults, task.id)
    };
  }

  private async loadGroupData(dataSource: any): Promise<any[]> {
    if (Array.isArray(dataSource)) {
      return dataSource;
    }

    if (typeof dataSource === 'string') {
      // Load from storage by ID
      return await this.loadDataFromStorage(dataSource);
    }

    throw new Error('Invalid data source for analysis');
  }

  private async preprocessData(data: any[], timePeriod?: any): Promise<any[]> {
    let processedData = [...data];

    // Filter by time period if specified
    if (timePeriod && timePeriod.start && timePeriod.end) {
      processedData = processedData.filter(member => {
        const extractedAt = new Date(member.extraction_timestamp || member.extractedAt);
        return extractedAt >= new Date(timePeriod.start) && 
               extractedAt <= new Date(timePeriod.end);
      });
    }

    // Clean and normalize data
    processedData = processedData.map(member => ({
      ...member,
      joinDate: this.parseDate(member.join_date || member.joinDate),
      lastSeen: this.parseDate(member.last_seen || member.lastSeen),
      extractedAt: this.parseDate(member.extraction_timestamp || member.extractedAt),
      hasPhone: !!member.phone_number,
      hasDescription: !!member.description && member.description.length > 10
    }));

    return processedData;
  }

  private async performAnalysis(
    data: any[],
    analysisType: string,
    depth: string,
    parameters: any,
    progressCallback: (progress: number) => void
  ): Promise<any> {
    switch (analysisType) {
      case 'activity':
        return await this.analyzeActivity(data, depth, progressCallback);
      case 'growth':
        return await this.analyzeGrowth(data, depth, progressCallback);
      case 'engagement':
        return await this.analyzeEngagement(data, depth, progressCallback);
      case 'demographics':
        return await this.analyzeDemographics(data, depth, progressCallback);
      case 'network':
        return await this.analyzeNetwork(data, depth, progressCallback);
      case 'sentiment':
        return await this.analyzeSentiment(data, depth, progressCallback);
      default:
        throw new Error(`Unsupported analysis type: ${analysisType}`);
    }
  }

  private async analyzeActivity(data: any[], depth: string, progressCallback: (progress: number) => void): Promise<any> {
    progressCallback(10);

    const activeMembers = data.filter(m => m.is_active);
    const inactiveMembers = data.filter(m => !m.is_active);
    
    progressCallback(30);

    // Analyze activity patterns
    const activityPatterns = {
      total_members: data.length,
      active_members: activeMembers.length,
      inactive_members: inactiveMembers.length,
      activity_rate: activeMembers.length / data.length,
      recent_joiners: this.countRecentJoiners(data, 30), // Last 30 days
      long_term_members: this.countLongTermMembers(data, 365) // Over 1 year
    };

    progressCallback(60);

    // Deep analysis if requested
    if (depth === 'deep') {
      activityPatterns['activity_distribution'] = this.analyzeActivityDistribution(data);
      activityPatterns['engagement_correlation'] = this.analyzeEngagementCorrelation(data);
    }

    progressCallback(100);

    return {
      type: 'activity',
      patterns: activityPatterns,
      trends: this.identifyActivityTrends(data),
      anomalies: this.detectActivityAnomalies(data)
    };
  }

  private async analyzeGrowth(data: any[], depth: string, progressCallback: (progress: number) => void): Promise<any> {
    progressCallback(20);

    // Group members by join date
    const membersByDate = this.groupMembersByJoinDate(data);
    
    progressCallback(40);

    // Calculate growth metrics
    const growthMetrics = {
      total_growth: data.length,
      monthly_growth: this.calculateMonthlyGrowth(membersByDate),
      growth_rate: this.calculateGrowthRate(membersByDate),
      peak_growth_period: this.findPeakGrowthPeriod(membersByDate)
    };

    progressCallback(70);

    // Predict future growth if deep analysis
    if (depth === 'deep') {
      growthMetrics['growth_prediction'] = this.predictGrowth(membersByDate);
      growthMetrics['seasonal_patterns'] = this.identifySeasonalPatterns(membersByDate);
    }

    progressCallback(100);

    return {
      type: 'growth',
      metrics: growthMetrics,
      timeline: membersByDate,
      projections: depth === 'deep' ? this.generateGrowthProjections(membersByDate) : null
    };
  }

  private async analyzeEngagement(data: any[], depth: string, progressCallback: (progress: number) => void): Promise<any> {
    progressCallback(15);

    const engagementMetrics = {
      members_with_descriptions: data.filter(m => m.hasDescription).length,
      members_with_phones: data.filter(m => m.hasPhone).length,
      admin_ratio: data.filter(m => m.is_admin).length / data.length,
      profile_completion_rate: this.calculateProfileCompletionRate(data)
    };

    progressCallback(50);

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(data, engagementMetrics);

    progressCallback(80);

    // Deep engagement analysis
    if (depth === 'deep') {
      engagementMetrics['engagement_segments'] = this.segmentByEngagement(data);
      engagementMetrics['correlation_analysis'] = this.analyzeEngagementCorrelations(data);
    }

    progressCallback(100);

    return {
      type: 'engagement',
      score: engagementScore,
      metrics: engagementMetrics,
      segments: this.identifyEngagementSegments(data)
    };
  }

  private async analyzeDemographics(data: any[], depth: string, progressCallback: (progress: number) => void): Promise<any> {
    progressCallback(25);

    // Analyze phone number patterns for geographic insights
    const phonePatterns = this.analyzePhonePatterns(data);
    
    progressCallback(50);

    // Name analysis for cultural insights
    const namePatterns = this.analyzeNamePatterns(data);

    progressCallback(75);

    const demographics = {
      geographic_distribution: phonePatterns.geographic,
      cultural_indicators: namePatterns.cultural,
      name_diversity: namePatterns.diversity,
      phone_coverage: phonePatterns.coverage
    };

    progressCallback(100);

    return {
      type: 'demographics',
      demographics,
      insights: this.generateDemographicInsights(demographics)
    };
  }

  private async generateInsights(analysisResults: any, analysisType: string): Promise<AnalysisInsight[]> {
    const insights: AnalysisInsight[] = [];

    switch (analysisType) {
      case 'activity':
        if (analysisResults.patterns.activity_rate > 0.8) {
          insights.push({
            category: 'activity',
            insight: 'High activity rate indicates a very engaged group',
            confidence: 0.9,
            supporting_data: { activity_rate: analysisResults.patterns.activity_rate }
          });
        }
        break;

      case 'growth':
        if (analysisResults.metrics.growth_rate > 0.1) {
          insights.push({
            category: 'growth',
            insight: 'Group is experiencing healthy growth',
            confidence: 0.85,
            supporting_data: { growth_rate: analysisResults.metrics.growth_rate }
          });
        }
        break;

      case 'engagement':
        if (analysisResults.score > 0.7) {
          insights.push({
            category: 'engagement',
            insight: 'Members show high engagement levels',
            confidence: 0.8,
            supporting_data: { engagement_score: analysisResults.score }
          });
        }
        break;
    }

    return insights;
  }

  private async generateRecommendations(analysisResults: any, analysisType: string): Promise<string[]> {
    const recommendations: string[] = [];

    switch (analysisType) {
      case 'activity':
        if (analysisResults.patterns.activity_rate < 0.5) {
          recommendations.push('Consider strategies to re-engage inactive members');
          recommendations.push('Analyze factors contributing to member inactivity');
        }
        break;

      case 'growth':
        if (analysisResults.metrics.growth_rate < 0.05) {
          recommendations.push('Implement member referral programs');
          recommendations.push('Increase group visibility and marketing efforts');
        }
        break;

      case 'engagement':
        if (analysisResults.score < 0.6) {
          recommendations.push('Encourage members to complete their profiles');
          recommendations.push('Create more interactive content to boost engagement');
        }
        break;
    }

    return recommendations;
  }

  private identifyRiskFactors(analysisResults: any): any[] {
    const riskFactors = [];

    // High churn risk
    if (analysisResults.patterns?.activity_rate < 0.3) {
      riskFactors.push({
        factor: 'High member inactivity',
        severity: 'high',
        description: 'Low activity rate may indicate declining group health'
      });
    }

    // Rapid growth risk
    if (analysisResults.metrics?.growth_rate > 0.5) {
      riskFactors.push({
        factor: 'Rapid growth',
        severity: 'medium',
        description: 'Very fast growth may impact group quality and management'
      });
    }

    return riskFactors;
  }

  // Helper methods for calculations
  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }

  private countRecentJoiners(data: any[], days: number): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return data.filter(member => {
      const joinDate = this.parseDate(member.joinDate);
      return joinDate && joinDate >= cutoff;
    }).length;
  }

  private calculateEngagementScore(data: any[], metrics: any): number {
    // Weighted engagement score calculation
    const weights = {
      profile_completion: 0.3,
      phone_availability: 0.2,
      description_quality: 0.3,
      admin_participation: 0.2
    };

    const score = 
      (metrics.profile_completion_rate * weights.profile_completion) +
      ((metrics.members_with_phones / data.length) * weights.phone_availability) +
      ((metrics.members_with_descriptions / data.length) * weights.description_quality) +
      (metrics.admin_ratio * weights.admin_participation);

    return Math.min(1.0, Math.max(0.0, score));
  }

  private calculateProfileCompletionRate(data: any[]): number {
    const completionScores = data.map(member => {
      let score = 0;
      if (member.name) score += 0.3;
      if (member.phone_number) score += 0.4;
      if (member.hasDescription) score += 0.3;
      return score;
    });

    return completionScores.reduce((sum, score) => sum + score, 0) / data.length;
  }

  // Additional helper methods would be implemented here...
}
```

### **Fase 3.2: Real-time Monitoring with Streaming**

#### **Implementação GroupMonitoringExecutor.ts**
```typescript
import { injectable, inject } from 'inversify';
import { EventBus } from '../core/EventBus';
import { ILogger } from '../types/ILogger';
import { A2ATask } from './TaskManager';
import { WebSocketManager } from './WebSocketManager';

export interface GroupChange {
  change_id: string;
  change_type: 'member_joined' | 'member_left' | 'admin_promoted' | 'admin_demoted' | 'group_info_changed';
  timestamp: string;
  member_info?: any;
  details: any;
}

@injectable()
export class GroupMonitoringExecutor {
  private activeMonitoringSessions = new Map<string, MonitoringSession>();

  constructor(
    @inject('EventBus') private eventBus: EventBus,
    @inject('ILogger') private logger: ILogger,
    @inject('WebSocketManager') private wsManager: WebSocketManager
  ) {}

  async execute(
    task: A2ATask,
    progressCallback: (progress: number, status?: string) => void
  ): Promise<any> {
    const {
      group_url,
      webhook_url,
      monitoring_duration,
      change_types = ['member_joined', 'member_left'],
      notification_threshold = 1,
      sampling_interval = 300 // 5 minutes
    } = task.input;

    progressCallback(10, 'Setting up monitoring session');

    // Create monitoring session
    const session = await this.createMonitoringSession(
      task.id,
      group_url,
      monitoring_duration,
      change_types,
      webhook_url,
      notification_threshold,
      sampling_interval
    );

    progressCallback(30, 'Starting group monitoring');

    // Start monitoring
    await this.startMonitoring(session, progressCallback);

    return {
      data: {
        monitoring_session: {
          session_id: session.id,
          status: 'active',
          started_at: session.startedAt,
          ends_at: session.endsAt,
          changes_detected: [],
          total_changes: 0,
          notifications_sent: 0
        }
      },
      artifacts: []
    };
  }

  private async createMonitoringSession(
    taskId: string,
    groupUrl: string,
    duration: number,
    changeTypes: string[],
    webhookUrl?: string,
    threshold: number = 1,
    interval: number = 300
  ): Promise<MonitoringSession> {
    const session: MonitoringSession = {
      id: `monitoring_${taskId}`,
      taskId,
      groupUrl,
      duration,
      changeTypes,
      webhookUrl,
      threshold,
      interval,
      startedAt: new Date(),
      endsAt: new Date(Date.now() + duration * 1000),
      changes: [],
      status: 'active',
      lastSnapshot: null,
      intervalHandle: null
    };

    this.activeMonitoringSessions.set(session.id, session);
    return session;
  }

  private async startMonitoring(
    session: MonitoringSession,
    progressCallback: (progress: number, status?: string) => void
  ): Promise<void> {
    this.logger.info('Starting group monitoring', {
      sessionId: session.id,
      groupUrl: session.groupUrl,
      duration: session.duration
    });

    progressCallback(50, 'Taking initial snapshot');

    // Take initial snapshot
    session.lastSnapshot = await this.takeGroupSnapshot(session.groupUrl);

    progressCallback(70, 'Setting up monitoring intervals');

    // Setup periodic monitoring
    session.intervalHandle = setInterval(async () => {
      try {
        await this.checkForChanges(session);
      } catch (error) {
        this.logger.error('Error during monitoring check', error, {
          sessionId: session.id
        });
      }
    }, session.interval * 1000);

    progressCallback(90, 'Setting up session timeout');

    // Setup session timeout
    setTimeout(async () => {
      await this.endMonitoringSession(session.id);
    }, session.duration * 1000);

    progressCallback(100, 'Monitoring session active');

    // Emit streaming event for session start
    this.emitStreamingEvent(session.taskId, {
      type: 'monitoring_started',
      session_id: session.id,
      timestamp: new Date().toISOString(),
      data: {
        group_url: session.groupUrl,
        monitoring_duration: session.duration,
        change_types: session.changeTypes
      }
    });
  }

  private async checkForChanges(session: MonitoringSession): Promise<void> {
    try {
      // Take new snapshot
      const currentSnapshot = await this.takeGroupSnapshot(session.groupUrl);
      
      // Compare with last snapshot
      const changes = await this.compareSnapshots(
        session.lastSnapshot,
        currentSnapshot,
        session.changeTypes
      );

      if (changes.length > 0) {
        // Process detected changes
        for (const change of changes) {
          session.changes.push(change);
          
          // Emit streaming event for each change
          this.emitStreamingEvent(session.taskId, {
            type: 'change_detected',
            session_id: session.id,
            timestamp: change.timestamp,
            data: change
          });

          this.logger.info('Group change detected', {
            sessionId: session.id,
            changeType: change.change_type,
            changeId: change.change_id
          });
        }

        // Send webhook notification if configured and threshold met
        if (session.webhookUrl && changes.length >= session.threshold) {
          await this.sendWebhookNotification(session, changes);
        }

        // Update last snapshot
        session.lastSnapshot = currentSnapshot;
      }

    } catch (error) {
      this.logger.error('Failed to check for group changes', error, {
        sessionId: session.id
      });
      
      // Emit error event
      this.emitStreamingEvent(session.taskId, {
        type: 'error_occurred',
        session_id: session.id,
        timestamp: new Date().toISOString(),
        data: {
          error: error.message,
          error_code: 'MONITORING_ERROR'
        }
      });
    }
  }

  private async takeGroupSnapshot(groupUrl: string): Promise<GroupSnapshot> {
    // This would integrate with the existing WhatsApp extractor
    // For now, return a mock snapshot
    return {
      timestamp: new Date().toISOString(),
      members: [], // Would be populated by actual extraction
      groupInfo: {
        name: 'Sample Group',
        description: 'Sample Description',
        memberCount: 50,
        adminCount: 2
      }
    };
  }

  private async compareSnapshots(
    oldSnapshot: GroupSnapshot | null,
    newSnapshot: GroupSnapshot,
    changeTypes: string[]
  ): Promise<GroupChange[]> {
    const changes: GroupChange[] = [];

    if (!oldSnapshot) {
      return changes; // No comparison possible for first snapshot
    }

    // Compare member lists for joins/leaves
    if (changeTypes.includes('member_joined') || changeTypes.includes('member_left')) {
      const memberChanges = this.detectMemberChanges(oldSnapshot.members, newSnapshot.members);
      changes.push(...memberChanges);
    }

    // Compare admin status
    if (changeTypes.includes('admin_promoted') || changeTypes.includes('admin_demoted')) {
      const adminChanges = this.detectAdminChanges(oldSnapshot.members, newSnapshot.members);
      changes.push(...adminChanges);
    }

    // Compare group info
    if (changeTypes.includes('group_info_changed')) {
      const infoChanges = this.detectGroupInfoChanges(oldSnapshot.groupInfo, newSnapshot.groupInfo);
      changes.push(...infoChanges);
    }

    return changes;
  }

  private detectMemberChanges(oldMembers: any[], newMembers: any[]): GroupChange[] {
    const changes: GroupChange[] = [];
    
    const oldMemberIds = new Set(oldMembers.map(m => m.id));
    const newMemberIds = new Set(newMembers.map(m => m.id));

    // Detect new members (joins)
    for (const member of newMembers) {
      if (!oldMemberIds.has(member.id)) {
        changes.push({
          change_id: `join_${member.id}_${Date.now()}`,
          change_type: 'member_joined',
          timestamp: new Date().toISOString(),
          member_info: member,
          details: {
            member_name: member.name,
            member_phone: member.phone_number
          }
        });
      }
    }

    // Detect removed members (leaves)
    for (const member of oldMembers) {
      if (!newMemberIds.has(member.id)) {
        changes.push({
          change_id: `leave_${member.id}_${Date.now()}`,
          change_type: 'member_left',
          timestamp: new Date().toISOString(),
          member_info: member,
          details: {
            member_name: member.name,
            member_phone: member.phone_number
          }
        });
      }
    }

    return changes;
  }

  private async sendWebhookNotification(session: MonitoringSession, changes: GroupChange[]): Promise<void> {
    if (!session.webhookUrl) return;

    try {
      const payload = {
        session_id: session.id,
        group_url: session.groupUrl,
        changes,
        timestamp: new Date().toISOString(),
        total_changes: session.changes.length
      };

      const response = await fetch(session.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WhatsApp-Scraper-A2A/2.0'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        this.logger.info('Webhook notification sent', {
          sessionId: session.id,
          webhookUrl: session.webhookUrl,
          changesCount: changes.length
        });
      } else {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

    } catch (error) {
      this.logger.error('Failed to send webhook notification', error, {
        sessionId: session.id,
        webhookUrl: session.webhookUrl
      });
    }
  }

  private emitStreamingEvent(taskId: string, event: any): void {
    // Emit to WebSocket connections
    this.wsManager.broadcastToTask(taskId, event);
    
    // Emit to internal event bus
    this.eventBus.emit('a2a:monitoring:event', {
      taskId,
      event
    });
  }

  private async endMonitoringSession(sessionId: string): Promise<void> {
    const session = this.activeMonitoringSessions.get(sessionId);
    if (!session) return;

    // Clear interval
    if (session.intervalHandle) {
      clearInterval(session.intervalHandle);
    }

    // Update session status
    session.status = 'completed';

    // Emit final streaming event
    this.emitStreamingEvent(session.taskId, {
      type: 'monitoring_ended',
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      data: {
        total_changes: session.changes.length,
        duration: session.duration,
        status: 'completed'
      }
    });

    // Remove from active sessions
    this.activeMonitoringSessions.delete(sessionId);

    this.logger.info('Monitoring session ended', {
      sessionId,
      totalChanges: session.changes.length,
      duration: session.duration
    });
  }

  // Helper interfaces
  interface MonitoringSession {
    id: string;
    taskId: string;
    groupUrl: string;
    duration: number;
    changeTypes: string[];
    webhookUrl?: string;
    threshold: number;
    interval: number;
    startedAt: Date;
    endsAt: Date;
    changes: GroupChange[];
    status: 'active' | 'completed' | 'error';
    lastSnapshot: GroupSnapshot | null;
    intervalHandle: NodeJS.Timeout | null;
  }

  interface GroupSnapshot {
    timestamp: string;
    members: any[];
    groupInfo: {
      name: string;
      description: string;
      memberCount: number;
      adminCount: number;
    };
  }
}
```

### **Fase 3.3: WebSocket Manager**

#### **Implementação WebSocketManager.ts**
```typescript
import { injectable, inject } from 'inversify';
import { Server as WebSocketServer, WebSocket } from 'ws';
import { ILogger } from '../types/ILogger';
import { A2AAuthMiddleware, A2AContext } from '../middleware/A2AAuthMiddleware';

export interface A2AWebSocketConnection {
  ws: WebSocket;
  id: string;
  context: A2AContext;
  subscribedTasks: Set<string>;
  connected_at: Date;
}

@injectable()
export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private connections = new Map<string, A2AWebSocketConnection>();
  private taskSubscriptions = new Map<string, Set<string>>(); // taskId -> connectionIds

  constructor(
    @inject('ILogger') private logger: ILogger,
    @inject('A2AAuthMiddleware') private auth: A2AAuthMiddleware
  ) {}

  async start(port: number = 3002): Promise<void> {
    this.wss = new WebSocketServer({
      port,
      path: '/a2a/stream'
    });

    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    this.logger.info('A2A WebSocket server started', { port });
  }

  async stop(): Promise<void> {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    // Close all connections
    for (const connection of this.connections.values()) {
      connection.ws.close();
    }

    this.connections.clear();
    this.taskSubscriptions.clear();

    this.logger.info('A2A WebSocket server stopped');
  }

  broadcastToTask(taskId: string, event: any): void {
    const connectionIds = this.taskSubscriptions.get(taskId);
    if (!connectionIds) return;

    const message = JSON.stringify({
      type: 'task_event',
      task_id: taskId,
      event,
      timestamp: new Date().toISOString()
    });

    for (const connectionId of connectionIds) {
      const connection = this.connections.get(connectionId);
      if (connection && connection.ws.readyState === WebSocket.OPEN) {
        try {
          connection.ws.send(message);
        } catch (error) {
          this.logger.error('Failed to send WebSocket message', error, {
            connectionId,
            taskId
          });
        }
      }
    }
  }

  private async handleConnection(ws: WebSocket, request: any): Promise<void> {
    const connectionId = this.generateConnectionId();
    
    this.logger.info('New WebSocket connection', { connectionId });

    // Setup message handler
    ws.on('message', async (data) => {
      try {
        await this.handleMessage(connectionId, data.toString());
      } catch (error) {
        this.logger.error('WebSocket message handling failed', error, {
          connectionId
        });
        
        ws.send(JSON.stringify({
          type: 'error',
          error: {
            code: 'MESSAGE_HANDLING_ERROR',
            message: error.message
          }
        }));
      }
    });

    // Setup close handler
    ws.on('close', () => {
      this.handleDisconnection(connectionId);
    });

    // Setup error handler
    ws.on('error', (error) => {
      this.logger.error('WebSocket error', error, { connectionId });
      this.handleDisconnection(connectionId);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      connection_id: connectionId,
      server_time: new Date().toISOString()
    }));
  }

  private async handleMessage(connectionId: string, message: string): Promise<void> {
    let parsedMessage: any;
    
    try {
      parsedMessage = JSON.parse(message);
    } catch (error) {
      throw new Error('Invalid JSON message');
    }

    const { type, ...data } = parsedMessage;

    switch (type) {
      case 'auth':
        await this.handleAuth(connectionId, data);
        break;
      case 'subscribe':
        await this.handleSubscribe(connectionId, data);
        break;
      case 'unsubscribe':
        await this.handleUnsubscribe(connectionId, data);
        break;
      case 'ping':
        await this.handlePing(connectionId);
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  }

  private async handleAuth(connectionId: string, data: any): Promise<void> {
    const { token } = data;

    try {
      // Authenticate using existing middleware
      const context = await this.auth.authenticate(`Bearer ${token}`);
      
      // Create connection record
      const connection: A2AWebSocketConnection = {
        ws: this.getConnectionWebSocket(connectionId),
        id: connectionId,
        context,
        subscribedTasks: new Set(),
        connected_at: new Date()
      };

      this.connections.set(connectionId, connection);

      // Send auth success
      connection.ws.send(JSON.stringify({
        type: 'auth_success',
        agent_id: context.agent_id,
        agent_name: context.agent_name,
        scopes: context.scopes
      }));

      this.logger.info('WebSocket authentication successful', {
        connectionId,
        agentId: context.agent_id
      });

    } catch (error) {
      // Send auth failure
      const ws = this.getConnectionWebSocket(connectionId);
      ws.send(JSON.stringify({
        type: 'auth_error',
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: error.message
        }
      }));

      // Close connection after auth failure
      setTimeout(() => ws.close(), 1000);
    }
  }

  private async handleSubscribe(connectionId: string, data: any): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not authenticated');
    }

    const { task_id } = data;
    if (!task_id) {
      throw new Error('task_id is required for subscription');
    }

    // Add to subscriptions
    connection.subscribedTasks.add(task_id);
    
    if (!this.taskSubscriptions.has(task_id)) {
      this.taskSubscriptions.set(task_id, new Set());
    }
    this.taskSubscriptions.get(task_id)!.add(connectionId);

    // Send subscription confirmation
    connection.ws.send(JSON.stringify({
      type: 'subscribed',
      task_id,
      timestamp: new Date().toISOString()
    }));

    this.logger.info('WebSocket subscribed to task', {
      connectionId,
      taskId: task_id,
      agentId: connection.context.agent_id
    });
  }

  private async handleUnsubscribe(connectionId: string, data: any): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { task_id } = data;
    
    // Remove from subscriptions
    connection.subscribedTasks.delete(task_id);
    
    const taskConnections = this.taskSubscriptions.get(task_id);
    if (taskConnections) {
      taskConnections.delete(connectionId);
      if (taskConnections.size === 0) {
        this.taskSubscriptions.delete(task_id);
      }
    }

    // Send unsubscription confirmation
    connection.ws.send(JSON.stringify({
      type: 'unsubscribed',
      task_id,
      timestamp: new Date().toISOString()
    }));
  }

  private async handlePing(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.ws.send(JSON.stringify({
      type: 'pong',
      timestamp: new Date().toISOString()
    }));
  }

  private handleDisconnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from all task subscriptions
    for (const taskId of connection.subscribedTasks) {
      const taskConnections = this.taskSubscriptions.get(taskId);
      if (taskConnections) {
        taskConnections.delete(connectionId);
        if (taskConnections.size === 0) {
          this.taskSubscriptions.delete(taskId);
        }
      }
    }

    // Remove connection
    this.connections.delete(connectionId);

    this.logger.info('WebSocket disconnected', {
      connectionId,
      agentId: connection.context?.agent_id,
      duration: Date.now() - connection.connected_at.getTime()
    });
  }

  private getConnectionWebSocket(connectionId: string): WebSocket {
    // This is a helper method to get WebSocket by connection ID
    // In practice, this would be stored during connection setup
    throw new Error('Connection not found');
  }

  private generateConnectionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getConnectionStats(): any {
    return {
      total_connections: this.connections.size,
      active_subscriptions: this.taskSubscriptions.size,
      connections_by_agent: this.getConnectionsByAgent()
    };
  }

  private getConnectionsByAgent(): Record<string, number> {
    const agentCounts: Record<string, number> = {};
    
    for (const connection of this.connections.values()) {
      const agentId = connection.context.agent_id;
      agentCounts[agentId] = (agentCounts[agentId] || 0) + 1;
    }

    return agentCounts;
  }
}
```

### **Fase 3.4: Performance Optimization & Caching**

#### **Implementação A2ACache.ts**
```typescript
import { injectable, inject } from 'inversify';
import { ILogger } from '../types/ILogger';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  access_count: number;
  last_accessed: number;
}

@injectable()
export class A2ACache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    @inject('ILogger') private logger: ILogger
  ) {
    // Setup periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000); // 5 minutes
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats
    entry.access_count++;
    entry.last_accessed = Date.now();

    return entry.data;
  }

  async set<T>(key: string, data: T, ttl: number = 3600000): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      access_count: 0,
      last_accessed: Date.now()
    });

    this.logger.debug('Cache entry stored', { key, ttl });
  }

  async invalidate(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug('Cache entry invalidated', { key });
    }
    return deleted;
  }

  async invalidatePattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    this.logger.debug('Cache pattern invalidated', { pattern, deletedCount });
    return deletedCount;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug('Cache cleanup completed', { cleanedCount });
    }
  }

  getStats(): any {
    const entries = Array.from(this.cache.values());
    
    return {
      total_entries: this.cache.size,
      total_access_count: entries.reduce((sum, entry) => sum + entry.access_count, 0),
      average_ttl: entries.reduce((sum, entry) => sum + entry.ttl, 0) / entries.length,
      memory_usage_estimate: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // String characters are 2 bytes each
      totalSize += JSON.stringify(entry.data).length * 2;
      totalSize += 64; // Overhead for entry metadata
    }

    return totalSize;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}
```

## 🧪 Testing Sprint 3

### **Testes de Análise**
```typescript
// test/a2a/sprint3/Analysis.test.ts
describe('A2A Group Analysis - Sprint 3', () => {
  let analysisExecutor: GroupAnalysisExecutor;

  beforeEach(() => {
    const container = createTestContainer();
    analysisExecutor = container.resolve(TOKENS.GroupAnalysisExecutor);
  });

  describe('Activity Analysis', () => {
    it('should analyze group activity patterns', async () => {
      const mockTask = {
        id: 'analysis-test-1',
        input: {
          data_source: MOCK_GROUP_DATA,
          analysis_type: 'activity',
          analysis_depth: 'standard'
        }
      };

      const result = await analysisExecutor.execute(mockTask, () => {});
      
      expect(result.data.analysis_results.analysis_type).toBe('activity');
      expect(result.data.analysis_results.insights).toBeInstanceOf(Array);
      expect(result.data.analysis_results.metrics).toBeDefined();
    });
  });

  describe('Growth Analysis', () => {
    it('should calculate growth metrics', async () => {
      const mockTask = {
        id: 'analysis-test-2',
        input: {
          data_source: MOCK_HISTORICAL_DATA,
          analysis_type: 'growth',
          analysis_depth: 'deep'
        }
      };

      const result = await analysisExecutor.execute(mockTask, () => {});
      
      expect(result.data.analysis_results.metrics.growth_rate).toBeGreaterThanOrEqual(0);
      expect(result.data.analysis_results.metrics.monthly_growth).toBeDefined();
    });
  });
});
```

### **Testes de Streaming**
```typescript
// test/a2a/sprint3/Streaming.test.ts
describe('A2A Streaming - Sprint 3', () => {
  let wsManager: WebSocketManager;
  let monitoringExecutor: GroupMonitoringExecutor;

  beforeEach(async () => {
    const container = createTestContainer();
    wsManager = container.resolve(TOKENS.WebSocketManager);
    monitoringExecutor = container.resolve(TOKENS.GroupMonitoringExecutor);
    
    await wsManager.start(3003);
  });

  afterEach(async () => {
    await wsManager.stop();
  });

  describe('WebSocket Connections', () => {
    it('should handle authentication and subscriptions', async () => {
      const ws = new WebSocket('ws://localhost:3003/a2a/stream');
      
      await new Promise(resolve => ws.on('open', resolve));
      
      // Authenticate
      ws.send(JSON.stringify({
        type: 'auth',
        token: TEST_JWT_TOKEN
      }));

      // Wait for auth success
      const authResult = await new Promise(resolve => {
        ws.on('message', (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === 'auth_success') {
            resolve(message);
          }
        });
      });

      expect(authResult.agent_id).toBeDefined();

      // Subscribe to task
      ws.send(JSON.stringify({
        type: 'subscribe',
        task_id: 'test-task-123'
      }));

      ws.close();
    });
  });

  describe('Group Monitoring', () => {
    it('should start monitoring session and detect changes', async () => {
      const mockTask = {
        id: 'monitoring-test-1',
        input: {
          group_url: 'https://chat.whatsapp.com/TEST123',
          monitoring_duration: 60, // 1 minute for test
          change_types: ['member_joined', 'member_left']
        }
      };

      const result = await monitoringExecutor.execute(mockTask, () => {});
      
      expect(result.data.monitoring_session.status).toBe('active');
      expect(result.data.monitoring_session.session_id).toBeDefined();
    });
  });
});
```

## 📊 Métricas Sprint 3

### **Performance Targets**
- 📊 Analysis execution: < 3min for standard depth
- 🌊 WebSocket latency: < 50ms
- 📱 Monitoring detection: < 30s for changes
- 💾 Cache hit rate: > 80%

### **Funcionalidades Entregues**
- ✅ Group analysis capability com 6 tipos de análise
- ✅ Real-time monitoring com WebSocket streaming
- ✅ Performance optimization com caching
- ✅ Advanced error handling
- ✅ Comprehensive monitoring integration

---

**Próximo Sprint**: [Sprint 4 - Production & Testing](./A2A_SPRINT_4_PRODUCTION_TESTING.md)

**Status**: 📋 **Pronto para Implementação**