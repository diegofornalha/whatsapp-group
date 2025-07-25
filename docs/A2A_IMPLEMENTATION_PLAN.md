# 🚀 A2A Protocol Implementation Plan - SPARC Mode Dev

## 📋 Plano de Implementação Coordenada

Esta documentação detalha o plano de implementação do A2A Protocol no WhatsApp Group Scraper usando **SPARC Development Mode** com coordenação Claude Flow.

## 🎯 Visão SPARC

### **S - Specification**
- **Agent Card**: Definição completa das capacidades
- **API Contracts**: Interfaces JSON-RPC 2.0
- **Security Model**: Integração com sistema existente
- **Data Schemas**: Tipagem TypeScript completa

### **P - Planning**
- **Phase-based approach**: 4 fases de 2 semanas cada
- **Parallel development**: Múltiplos agentes coordenados
- **Risk mitigation**: Testes incrementais
- **Resource allocation**: Optimização de desenvolvimento

### **A - Architecture**
- **Modular integration**: Aproveitamento da arquitetura existente
- **Microservice pattern**: A2A como camada de serviço
- **Event-driven**: Comunicação assíncrona
- **Scalable design**: Preparado para múltiplos agentes

### **R - Requirements**
- **Functional**: Capacidades A2A essenciais
- **Non-functional**: Performance, segurança, escalabilidade
- **Integration**: Compatibilidade com sistema atual
- **User Experience**: Interface intuitiva para agentes

### **C - Coding**
- **TypeScript first**: Tipagem completa
- **Test-driven**: TDD para todas as funcionalidades
- **Documentation**: Código auto-documentado
- **Best practices**: Padrões de desenvolvimento modernos

## 🏗️ Estrutura de Arquivos Proposta

```
src/
├── a2a/                          # 🤖 A2A Protocol Implementation
│   ├── server/
│   │   ├── A2AServer.ts         # Servidor principal JSON-RPC
│   │   ├── AgentCard.ts         # Definição de capacidades
│   │   ├── TaskManager.ts       # Gerenciamento de tarefas
│   │   ├── StreamingHandler.ts  # Suporte streaming
│   │   └── ProtocolRouter.ts    # Roteamento de mensagens
│   ├── client/
│   │   ├── A2AClient.ts         # Cliente para descoberta
│   │   ├── AgentDiscovery.ts    # Descoberta de agentes
│   │   └── TaskExecutor.ts      # Execução de tarefas
│   ├── capabilities/
│   │   ├── GroupExtraction.ts   # Extração de grupos
│   │   ├── DataAnalysis.ts      # Análise de dados
│   │   ├── DataExport.ts        # Exportação de dados
│   │   └── GroupMonitoring.ts   # Monitoramento real-time
│   ├── middleware/
│   │   ├── AuthMiddleware.ts    # Autenticação A2A
│   │   ├── SecurityMiddleware.ts # Segurança integrada
│   │   ├── RateLimitMiddleware.ts # Rate limiting
│   │   └── LoggingMiddleware.ts # Logs estruturados
│   ├── types/
│   │   ├── A2AProtocol.ts       # Tipos do protocolo
│   │   ├── TaskTypes.ts         # Tipos de tarefas
│   │   ├── AgentTypes.ts        # Tipos de agentes
│   │   └── MessageTypes.ts      # Tipos de mensagens
│   └── utils/
│       ├── ProtocolValidator.ts # Validação de protocolo
│       ├── MessageSerializer.ts # Serialização
│       └── ErrorHandler.ts     # Tratamento de erros
└── web/                         # 🌐 Web Interface for A2A
    ├── a2a-dashboard/
    │   ├── AgentRegistry.tsx    # Registro de agentes
    │   ├── TaskMonitor.tsx      # Monitor de tarefas
    │   ├── CapabilityExplorer.tsx # Explorador de capacidades
    │   └── InteractionLogs.tsx  # Logs de interação
    └── api/
        ├── a2a-endpoint.ts      # Endpoint HTTP
        └── websocket-handler.ts # WebSocket para streaming
```

## 🤖 Agent Capabilities Design

### **1. extract_group_members**
```typescript
interface GroupExtractionCapability {
  name: 'extract_group_members';
  description: 'Extract member data from WhatsApp groups with advanced filtering';
  input_schema: {
    group_url: string;           // WhatsApp group invite URL
    filters?: {
      active_only?: boolean;     // Only active members
      phone_numbers_only?: boolean; // Members with phone numbers
      exclude_patterns?: string[]; // Exclude patterns
      date_range?: {
        start: string;
        end: string;
      };
      limit?: number;            // Max members to extract
    };
    export_format?: 'json' | 'csv' | 'excel';
    metadata_level?: 'basic' | 'detailed' | 'full';
  };
  output_schema: {
    members: Member[];
    metadata: {
      total_members: number;
      extracted_members: number;
      group_info: GroupInfo;
      extraction_timestamp: string;
      filters_applied: object;
    };
    statistics: {
      active_members: number;
      inactive_members: number;
      members_with_phones: number;
      extraction_duration_ms: number;
    };
  };
  streaming: false;
  estimated_duration: '30s-5m';
  rate_limits: {
    requests_per_minute: 10;
    requests_per_hour: 100;
  };
}
```

### **2. analyze_group_patterns**
```typescript
interface GroupAnalysisCapability {
  name: 'analyze_group_patterns';
  description: 'Analyze member interaction patterns and group dynamics';
  input_schema: {
    group_data: Member[] | string; // Data or group_id
    analysis_type: 'activity' | 'growth' | 'engagement' | 'demographics';
    time_period?: {
      start: string;
      end: string;
    };
    analysis_depth?: 'quick' | 'standard' | 'deep';
  };
  output_schema: {
    analysis_results: {
      pattern_type: string;
      insights: Insight[];
      metrics: AnalysisMetrics;
      recommendations: string[];
    };
    visualizations?: {
      charts: ChartData[];
      graphs: GraphData[];
    };
  };
  streaming: false;
  estimated_duration: '1-3m';
}
```

### **3. monitor_group_changes**
```typescript
interface GroupMonitoringCapability {
  name: 'monitor_group_changes';
  description: 'Real-time monitoring of group member changes';
  input_schema: {
    group_url: string;
    webhook_url?: string;        // Optional webhook for notifications
    monitoring_duration: number; // Duration in seconds
    change_types?: ('join' | 'leave' | 'admin_change' | 'info_update')[];
    notification_threshold?: number; // Min changes to notify
  };
  output_schema: {
    monitoring_session: {
      session_id: string;
      status: 'active' | 'completed' | 'error';
      changes_detected: GroupChange[];
      total_changes: number;
    };
  };
  streaming: true;
  estimated_duration: 'real-time';
  rate_limits: {
    concurrent_streams: 3;
    max_duration_hours: 24;
  };
}
```

### **4. export_group_data**
```typescript
interface DataExportCapability {
  name: 'export_group_data';
  description: 'Export group data in various formats with custom templates';
  input_schema: {
    data_source: string | Member[]; // Group ID or direct data
    format: 'csv' | 'json' | 'excel' | 'pdf' | 'xml';
    template?: string;           // Custom template name
    customization?: {
      fields: string[];          // Select specific fields
      sort_by?: string;
      filters?: object;
      include_metadata?: boolean;
    };
    output_options?: {
      compression?: boolean;
      encryption?: boolean;
      split_files?: boolean;     // For large datasets
    };
  };
  output_schema: {
    export_result: {
      file_url: string;
      file_size: number;
      format: string;
      total_records: number;
      export_timestamp: string;
    };
    metadata: {
      template_used: string;
      processing_time_ms: number;
      compression_ratio?: number;
    };
  };
  streaming: false;
  estimated_duration: '10s-2m';
}
```

## 🔒 Security & Authentication

### **JWT-based Authentication**
```typescript
interface A2AAuthToken {
  agent_id: string;
  agent_name: string;
  capabilities: string[];
  rate_limits: RateLimit[];
  expires_at: number;
  issued_by: string;
  scopes: string[];
}

class A2AAuthentication {
  async authenticateAgent(token: string): Promise<A2AContext> {
    const payload = await this.jwtService.verify(token);
    
    // Validate agent registration
    const agent = await this.agentRegistry.findById(payload.agent_id);
    if (!agent || !agent.active) {
      throw new A2AError('AGENT_NOT_FOUND', 'Agent not registered or inactive');
    }

    // Check token expiration
    if (payload.expires_at < Date.now()) {
      throw new A2AError('TOKEN_EXPIRED', 'Authentication token has expired');
    }

    return {
      agent_id: payload.agent_id,
      agent_name: payload.agent_name,
      capabilities: payload.capabilities,
      rate_limits: payload.rate_limits,
      authenticated_at: new Date()
    };
  }
}
```

### **Rate Limiting Integration**
```typescript
class A2ARateLimiter {
  async checkCapabilityLimit(
    agentId: string, 
    capability: string, 
    context: A2AContext
  ): Promise<RateLimitResult> {
    const key = `a2a:${agentId}:${capability}`;
    const limits = this.getCapabilityLimits(capability);

    // Check with existing SecurityManager
    return await this.securityManager.rateLimiter.checkLimit(key, limits);
  }

  private getCapabilityLimits(capability: string): RateLimit {
    const limits = {
      'extract_group_members': { window: 60000, max: 10 },
      'analyze_group_patterns': { window: 60000, max: 5 },
      'monitor_group_changes': { concurrent: 3 },
      'export_group_data': { window: 300000, max: 20 }
    };

    return limits[capability] || { window: 60000, max: 1 };
  }
}
```

## 🔄 Task Lifecycle Management

### **Task States & Transitions**
```typescript
type TaskStatus = 
  | 'pending'      // Task created, waiting to start
  | 'queued'       // Task queued for execution
  | 'running'      // Task currently executing
  | 'streaming'    // Task streaming results
  | 'completed'    // Task completed successfully
  | 'failed'       // Task failed with error
  | 'cancelled'    // Task cancelled by agent
  | 'timeout'      // Task timed out
  | 'paused';      // Task paused (for streaming)

class TaskManager {
  private tasks = new Map<string, A2ATask>();
  private taskQueue = new Queue<A2ATask>();

  async createTask(request: CreateTaskRequest, context: A2AContext): Promise<A2ATask> {
    // Validate capability
    if (!this.isCapabilitySupported(request.capability)) {
      throw new A2AError('UNSUPPORTED_CAPABILITY', request.capability);
    }

    // Security and rate limit checks
    await this.securityManager.validateTaskCreation(request, context);
    await this.rateLimiter.checkCapabilityLimit(
      context.agent_id, 
      request.capability, 
      context
    );

    // Create task
    const task: A2ATask = {
      id: this.generateTaskId(),
      capability: request.capability,
      input: request.input,
      status: 'pending',
      created_at: new Date().toISOString(),
      created_by: context.agent_id,
      estimated_duration: this.getEstimatedDuration(request.capability),
      priority: request.priority || 'normal'
    };

    // Store task
    this.tasks.set(task.id, task);

    // Queue for execution
    await this.queueTask(task);

    // Emit event
    this.eventBus.emit('a2a:task:created', { task, context });

    return task;
  }

  async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new A2AError('TASK_NOT_FOUND', taskId);
    }

    try {
      // Update status
      task.status = 'running';
      task.started_at = new Date().toISOString();
      
      this.eventBus.emit('a2a:task:started', { task });

      // Execute based on capability
      const executor = this.getCapabilityExecutor(task.capability);
      const result = await executor.execute(task);

      // Complete task
      task.status = 'completed';
      task.completed_at = new Date().toISOString();
      task.result = result;
      task.artifacts = await this.generateArtifacts(result);

      this.eventBus.emit('a2a:task:completed', { task });

    } catch (error) {
      task.status = 'failed';
      task.error = {
        code: error.code || 'EXECUTION_ERROR',
        message: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      };

      this.eventBus.emit('a2a:task:failed', { task, error });
      throw error;
    }
  }
}
```

## 📊 Monitoring & Analytics

### **A2A Metrics Dashboard**
```typescript
interface A2AMetrics {
  tasks: {
    total_created: number;
    total_completed: number;
    total_failed: number;
    success_rate: number;
    avg_execution_time: number;
    by_capability: Record<string, CapabilityMetrics>;
  };
  agents: {
    total_registered: number;
    active_agents: number;
    top_agents_by_usage: AgentUsage[];
  };
  performance: {
    requests_per_minute: number;
    avg_response_time: number;
    error_rate: number;
    concurrent_tasks: number;
  };
  security: {
    authentication_attempts: number;
    rate_limit_hits: number;
    blocked_requests: number;
  };
}

class A2AMonitoring {
  constructor(
    private metricsCollector: MetricsCollector,
    private logger: ILogger
  ) {}

  trackTaskMetrics(task: A2ATask, event: string): void {
    const labels = {
      capability: task.capability,
      agent_id: task.created_by,
      status: task.status
    };

    switch (event) {
      case 'created':
        this.metricsCollector.incrementCounter('a2a.tasks.created', 1, labels);
        break;
      case 'completed':
        const duration = this.calculateDuration(task);
        this.metricsCollector.recordHistogram('a2a.task.duration', duration, labels);
        this.metricsCollector.incrementCounter('a2a.tasks.completed', 1, labels);
        break;
      case 'failed':
        this.metricsCollector.incrementCounter('a2a.tasks.failed', 1, labels);
        break;
    }
  }

  generatePerformanceReport(): A2APerformanceReport {
    return {
      timestamp: new Date().toISOString(),
      period: '24h',
      metrics: this.collectMetrics(),
      recommendations: this.generateRecommendations(),
      alerts: this.getActiveAlerts()
    };
  }
}
```

## 🧪 Testing Strategy

### **A2A Protocol Test Suite**
```typescript
// test/a2a/integration/A2AProtocol.test.ts
describe('A2A Protocol Integration', () => {
  let server: A2AServer;
  let client: A2AClient;
  let testAgent: TestA2AAgent;

  beforeAll(async () => {
    // Setup test environment
    server = await createTestA2AServer();
    client = new A2AClient('http://localhost:3001/a2a');
    testAgent = new TestA2AAgent();
    
    await server.start();
  });

  describe('Agent Discovery', () => {
    it('should discover WhatsApp scraper agent', async () => {
      const agents = await client.discoverAgents();
      
      expect(agents).toContainEqual(
        expect.objectContaining({
          name: 'WhatsApp Group Scraper',
          capabilities: expect.arrayContaining([
            expect.objectContaining({
              name: 'extract_group_members'
            })
          ])
        })
      );
    });

    it('should return valid agent card', async () => {
      const agentCard = await client.getAgentCard('whatsapp-scraper');
      
      validateAgentCard(agentCard);
      expect(agentCard.capabilities).toHaveLength(4);
    });
  });

  describe('Task Execution', () => {
    it('should execute group extraction task', async () => {
      const task = await client.createTask({
        agent: 'whatsapp-scraper',
        capability: 'extract_group_members',
        input: {
          group_url: MOCK_GROUP_URL,
          filters: { active_only: true }
        }
      });

      expect(task.status).toBe('pending');
      
      const result = await client.waitForCompletion(task.id, 30000);
      
      expect(result.status).toBe('completed');
      expect(result.artifacts).toHaveLength(1);
      expect(result.artifacts[0].type).toBe('csv');
    });

    it('should handle concurrent tasks', async () => {
      const tasks = await Promise.all([
        client.createTask({
          capability: 'extract_group_members',
          input: { group_url: MOCK_GROUP_URL_1 }
        }),
        client.createTask({
          capability: 'extract_group_members', 
          input: { group_url: MOCK_GROUP_URL_2 }
        }),
        client.createTask({
          capability: 'analyze_group_patterns',
          input: { group_data: MOCK_GROUP_DATA }
        })
      ]);

      const results = await Promise.all(
        tasks.map(task => client.waitForCompletion(task.id))
      );

      results.forEach(result => {
        expect(result.status).toBe('completed');
      });
    });
  });

  describe('Streaming Tasks', () => {
    it('should handle streaming group monitoring', async () => {
      const streamingTask = await client.createTask({
        capability: 'monitor_group_changes',
        input: {
          group_url: MOCK_GROUP_URL,
          monitoring_duration: 10 // 10 seconds for test
        }
      });

      const events: StreamEvent[] = [];
      
      await client.subscribeToTaskStream(streamingTask.id, (event) => {
        events.push(event);
      });

      // Simulate group changes
      await testAgent.simulateGroupChanges(MOCK_GROUP_URL);

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe('member_joined');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid capability', async () => {
      await expect(
        client.createTask({
          capability: 'invalid_capability',
          input: {}
        })
      ).rejects.toThrow('UNSUPPORTED_CAPABILITY');
    });

    it('should handle rate limiting', async () => {
      // Create tasks beyond rate limit
      const promises = Array.from({ length: 15 }, () =>
        client.createTask({
          capability: 'extract_group_members',
          input: { group_url: MOCK_GROUP_URL }
        })
      );

      await expect(Promise.all(promises)).rejects.toThrow('RATE_LIMIT_EXCEEDED');
    });
  });
});
```

## 🚀 Deployment Configuration

### **Production Setup**
```yaml
# docker-compose.a2a.yml
version: '3.8'
services:
  whatsapp-scraper-a2a:
    build:
      context: .
      dockerfile: Dockerfile.a2a
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - A2A_ENABLED=true
      - A2A_PORT=3001
      - JWT_SECRET=${JWT_SECRET}
      - RATE_LIMIT_REDIS_URL=${REDIS_URL}
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    depends_on:
      - redis
      - postgres
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=whatsapp_scraper
      - POSTGRES_USER=scraper
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### **Environment Configuration**
```bash
# .env.a2a
NODE_ENV=production
A2A_ENABLED=true
A2A_PORT=3001
A2A_HOST=0.0.0.0

# Security
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=24h
CORS_ORIGINS=http://localhost:3000,https://your-agent-portal.com

# Rate Limiting
REDIS_URL=redis://localhost:6379
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Database
DATABASE_URL=postgresql://scraper:password@localhost:5432/whatsapp_scraper

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
LOG_LEVEL=info

# Agent Registry
AGENT_REGISTRY_URL=https://a2a-registry.com
AUTO_REGISTER=true
```

## 📈 Performance Optimization

### **Caching Strategy**
```typescript
class A2ACache {
  constructor(
    private redis: Redis,
    private logger: ILogger
  ) {}

  async cacheAgentCard(agentId: string, card: AgentCard): Promise<void> {
    const key = `agent_card:${agentId}`;
    await this.redis.setex(key, 3600, JSON.stringify(card)); // 1 hour TTL
  }

  async getCachedTaskResult(taskId: string): Promise<TaskResult | null> {
    const key = `task_result:${taskId}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async cacheGroupData(groupUrl: string, data: Member[]): Promise<void> {
    const key = `group_data:${this.hashUrl(groupUrl)}`;
    await this.redis.setex(key, 1800, JSON.stringify(data)); // 30 min TTL
  }
}

class PerformanceOptimizer {
  async optimizeTaskExecution(task: A2ATask): Promise<OptimizationResult> {
    // Check cache first
    const cached = await this.cache.getCachedTaskResult(task.id);
    if (cached && this.isCacheValid(cached, task)) {
      return { cached: true, result: cached };
    }

    // Optimize based on capability
    switch (task.capability) {
      case 'extract_group_members':
        return await this.optimizeGroupExtraction(task);
      case 'analyze_group_patterns':
        return await this.optimizeGroupAnalysis(task);
      default:
        return { optimized: false };
    }
  }
}
```

## 🔍 Debugging & Troubleshooting

### **A2A Debug Console**
```typescript
class A2ADebugger {
  constructor(private server: A2AServer) {}

  async debugTask(taskId: string): Promise<TaskDebugInfo> {
    const task = await this.server.getTask(taskId);
    const logs = await this.getTaskLogs(taskId);
    const metrics = await this.getTaskMetrics(taskId);

    return {
      task,
      logs,
      metrics,
      troubleshooting: this.generateTroubleshootingTips(task)
    };
  }

  generateHealthReport(): A2AHealthReport {
    return {
      server_status: this.server.getStatus(),
      active_tasks: this.server.getActiveTasks().length,
      memory_usage: process.memoryUsage(),
      uptime: process.uptime(),
      last_errors: this.getRecentErrors(),
      recommendations: this.generateHealthRecommendations()
    };
  }
}

// Usage in production
const debugger = new A2ADebugger(a2aServer);
const healthReport = debugger.generateHealthReport();
console.log('A2A Health Status:', healthReport);
```

## 📚 Implementation Timeline

### **Sprint 1 (Week 1-2): Foundation**
- ✅ A2A Server core implementation
- ✅ Agent Card specification
- ✅ Basic JSON-RPC routing
- ✅ Authentication middleware
- ✅ Integration with existing DI container

### **Sprint 2 (Week 3-4): Core Capabilities**
- ✅ `extract_group_members` capability
- ✅ `export_group_data` capability
- ✅ Task lifecycle management
- ✅ Security integration
- ✅ Basic monitoring

### **Sprint 3 (Week 5-6): Advanced Features**
- ✅ `analyze_group_patterns` capability
- ✅ `monitor_group_changes` with streaming
- ✅ Rate limiting integration
- ✅ Performance optimization
- ✅ Comprehensive testing

### **Sprint 4 (Week 7-8): Production Ready**
- ✅ Production deployment setup
- ✅ Monitoring dashboards
- ✅ Documentation completion
- ✅ Load testing
- ✅ Security audit

## 🎯 Success Metrics

### **Technical Metrics**
- **Response Time**: < 2s for simple tasks, < 30s for complex
- **Throughput**: 100+ concurrent tasks
- **Uptime**: 99.9% availability
- **Error Rate**: < 1% failed tasks

### **Integration Metrics**  
- **Agent Adoption**: 10+ external agents using our capabilities
- **Task Volume**: 1000+ tasks per day
- **API Usage**: 95% of capabilities actively used

### **Business Metrics**
- **Developer Satisfaction**: 4.5/5 integration experience
- **Documentation Quality**: Complete API coverage
- **Community Growth**: Active A2A ecosystem participation

---

**Status**: 🎯 **Implementation Plan Complete - Ready for Development Sprint** 

Próximo passo: Iniciar Sprint 1 com setup da fundação A2A Protocol! 🚀