# 🏗️ A2A Protocol - Sprint 1: Core Infrastructure

## 📋 Sprint Overview

**Objetivo**: Estabelecer a infraestrutura base do A2A Protocol integrada com a arquitetura existente do WhatsApp Scraper.

**Duração Estimada**: 2 semanas  
**Prioridade**: 🔴 Crítica  
**Dependências**: Arquitetura modular existente  

## 🎯 Objetivos do Sprint

### **Principais Entregas**
- ✅ A2A Server base funcional
- ✅ Agent Card implementation 
- ✅ JSON-RPC 2.0 API básica
- ✅ Authentication middleware
- ✅ Integração com DI Container existente
- ✅ Task lifecycle básico

### **Critérios de Aceitação**
- [ ] A2A Server responde a requisições básicas
- [ ] Agent Card é retornado corretamente
- [ ] Autenticação JWT funcional
- [ ] Task pode ser criado e consultado
- [ ] Integração com sistema de logs existente

## 🛠️ Implementação Detalhada

### **Fase 1.1: Setup Base do A2A Server**

#### **Arquivos a Criar**
```
src/a2a/
├── server/
│   ├── A2AServer.ts          # Servidor principal
│   ├── JsonRpcRouter.ts      # Roteamento JSON-RPC
│   └── RequestHandler.ts     # Handler de requisições
├── types/
│   ├── A2AProtocol.ts        # Tipos base do protocolo
│   ├── JsonRpc.ts            # Tipos JSON-RPC 2.0
│   └── AgentCard.ts          # Tipos do Agent Card
└── config/
    └── a2a-config.ts         # Configuração específica
```

#### **Implementação A2AServer.ts**
```typescript
import { injectable, inject } from 'inversify';
import { ILogger } from '../types/ILogger';
import { EventBus } from '../core/EventBus';
import { SecurityManager } from '../core/security/SecurityManager';
import { JsonRpcRouter } from './JsonRpcRouter';

@injectable()
export class A2AServer {
  private router: JsonRpcRouter;
  private isRunning = false;

  constructor(
    @inject('ILogger') private logger: ILogger,
    @inject('EventBus') private eventBus: EventBus,
    @inject('SecurityManager') private security: SecurityManager
  ) {
    this.router = new JsonRpcRouter(this.logger);
    this.setupRoutes();
  }

  async start(port: number = 3001): Promise<void> {
    if (this.isRunning) {
      throw new Error('A2A Server already running');
    }

    try {
      // Setup HTTP server
      await this.setupHttpServer(port);
      
      this.isRunning = true;
      this.logger.info('A2A Server started', { port });
      this.eventBus.emit('a2a:server:started', { port });

    } catch (error) {
      this.logger.error('Failed to start A2A Server', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    // Cleanup and shutdown
    this.isRunning = false;
    this.logger.info('A2A Server stopped');
    this.eventBus.emit('a2a:server:stopped', {});
  }

  private setupRoutes(): void {
    // Standard A2A methods
    this.router.addMethod('getAgentCard', this.getAgentCard.bind(this));
    this.router.addMethod('createTask', this.createTask.bind(this));
    this.router.addMethod('getTaskStatus', this.getTaskStatus.bind(this));
    this.router.addMethod('cancelTask', this.cancelTask.bind(this));
    this.router.addMethod('listTasks', this.listTasks.bind(this));
  }

  private async getAgentCard(): Promise<AgentCard> {
    return {
      schema_version: "0.0.1a1",
      name: "WhatsApp Group Scraper",
      description: "Advanced WhatsApp group member extraction agent",
      agent_id: "whatsapp-group-scraper",
      version: "2.0.0",
      url: process.env.A2A_BASE_URL || "http://localhost:3001/a2a",
      
      auth: {
        type: "bearer_token",
        description: "JWT token required for authentication"
      },

      capabilities: [], // Será populado na próxima fase
      
      rate_limits: {
        global: {
          requests_per_minute: 100,
          requests_per_hour: 1000,
          concurrent_tasks: 10
        }
      },

      metadata: {
        version: "2.0.0",
        supported_languages: ["pt-BR", "en-US"],
        security_features: ["rate_limiting", "audit_logging", "anomaly_detection"]
      }
    };
  }

  // Placeholder methods - implementação completa nas próximas fases
  private async createTask(params: any): Promise<any> {
    throw new JsonRpcError(-32601, 'Method not implemented yet');
  }

  private async getTaskStatus(params: any): Promise<any> {
    throw new JsonRpcError(-32601, 'Method not implemented yet');
  }

  private async cancelTask(params: any): Promise<any> {
    throw new JsonRpcError(-32601, 'Method not implemented yet');
  }

  private async listTasks(params: any): Promise<any> {
    throw new JsonRpcError(-32601, 'Method not implemented yet');
  }
}
```

#### **Implementação JsonRpcRouter.ts**
```typescript
import { ILogger } from '../types/ILogger';

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id?: string | number | null;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: JsonRpcError;
  id: string | number | null;
}

export class JsonRpcError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'JsonRpcError';
  }
}

export class JsonRpcRouter {
  private methods = new Map<string, Function>();

  constructor(private logger: ILogger) {}

  addMethod(name: string, handler: Function): void {
    this.methods.set(name, handler);
    this.logger.debug('JSON-RPC method registered', { method: name });
  }

  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { method, params, id } = request;

    try {
      // Validate JSON-RPC 2.0 format
      if (request.jsonrpc !== '2.0') {
        throw new JsonRpcError(-32600, 'Invalid Request');
      }

      // Check if method exists
      const handler = this.methods.get(method);
      if (!handler) {
        throw new JsonRpcError(-32601, 'Method not found');
      }

      // Execute method
      const result = await handler(params);

      return {
        jsonrpc: '2.0',
        result,
        id
      };

    } catch (error) {
      this.logger.error('JSON-RPC method execution failed', error, {
        method,
        params,
        id
      });

      const jsonRpcError = error instanceof JsonRpcError 
        ? error 
        : new JsonRpcError(-32603, 'Internal error');

      return {
        jsonrpc: '2.0',
        error: {
          code: jsonRpcError.code,
          message: jsonRpcError.message,
          data: jsonRpcError.data
        },
        id
      };
    }
  }
}
```

### **Fase 1.2: Authentication Middleware**

#### **Implementação AuthMiddleware.ts**
```typescript
import { SecurityManager } from '../core/security/SecurityManager';
import { ILogger } from '../types/ILogger';

export interface A2AContext {
  agent_id: string;
  agent_name: string;
  scopes: string[];
  capabilities: string[];
  authenticated_at: Date;
  rate_limits: any;
}

export class A2AAuthMiddleware {
  constructor(
    private security: SecurityManager,
    private logger: ILogger
  ) {}

  async authenticate(authHeader: string): Promise<A2AContext> {
    try {
      // Extract Bearer token
      const token = this.extractBearerToken(authHeader);
      if (!token) {
        throw new Error('Bearer token required');
      }

      // Validate JWT with existing security system
      const payload = await this.security.validateJWT(token);

      // Validate agent registration
      const agentInfo = await this.validateAgent(payload.agent_id);

      return {
        agent_id: payload.agent_id,
        agent_name: payload.agent_name || payload.agent_id,
        scopes: payload.scopes || [],
        capabilities: payload.capabilities || [],
        authenticated_at: new Date(),
        rate_limits: payload.rate_limits || {}
      };

    } catch (error) {
      this.logger.warn('A2A authentication failed', { error: error.message });
      throw new JsonRpcError(-32001, 'Authentication failed');
    }
  }

  async authorize(capability: string, context: A2AContext): Promise<boolean> {
    // Check if agent has permission for capability
    if (context.capabilities.includes('*') || 
        context.capabilities.includes(capability)) {
      return true;
    }

    // Check scope-based authorization
    const requiredScope = this.getRequiredScope(capability);
    return context.scopes.includes(requiredScope) || 
           context.scopes.includes('*');
  }

  private extractBearerToken(authHeader: string): string | null {
    const match = authHeader?.match(/^Bearer\s+(.+)$/);
    return match ? match[1] : null;
  }

  private async validateAgent(agentId: string): Promise<any> {
    // Integration point with agent registry
    // For now, return basic info
    return {
      id: agentId,
      active: true,
      registered_at: new Date()
    };
  }

  private getRequiredScope(capability: string): string {
    const scopeMap = {
      'extract_group_members': 'extract:members',
      'analyze_group_patterns': 'analyze:patterns',
      'export_group_data': 'export:data',
      'monitor_group_changes': 'monitor:groups'
    };
    
    return scopeMap[capability] || 'unknown';
  }
}
```

### **Fase 1.3: Integração com DI Container**

#### **Atualização tokens.ts**
```typescript
// src/core/di/tokens.ts (adicionar)
export const TOKENS = {
  // ... existing tokens ...
  
  // A2A Protocol tokens
  A2AServer: Symbol('A2AServer'),
  A2AAuthMiddleware: Symbol('A2AAuthMiddleware'),
  A2ATaskManager: Symbol('A2ATaskManager'),
  A2AMetrics: Symbol('A2AMetrics')
};
```

#### **Atualização bootstrap.ts**
```typescript
// src/core/di/bootstrap.ts (adicionar)
import { A2AServer } from '../../a2a/server/A2AServer';
import { A2AAuthMiddleware } from '../../a2a/middleware/A2AAuthMiddleware';

export async function bootstrapApplication(): Promise<{
  container: DIContainer;
  serviceRegistry: ServiceRegistry;
  a2aServer?: A2AServer;
}> {
  // ... existing bootstrap code ...

  // Register A2A services if enabled
  const a2aEnabled = config.get('a2a.enabled', false);
  
  if (a2aEnabled) {
    container.singleton(TOKENS.A2AAuthMiddleware, (c) => new A2AAuthMiddleware(
      c.resolve(TOKENS.SecurityManager),
      c.resolve(TOKENS.Logger)
    ));

    container.singleton(TOKENS.A2AServer, (c) => new A2AServer(
      c.resolve(TOKENS.Logger),
      c.resolve(TOKENS.EventBus),
      c.resolve(TOKENS.SecurityManager)
    ));
  }

  // Start A2A server if enabled
  let a2aServer: A2AServer | undefined;
  if (a2aEnabled) {
    a2aServer = container.resolve<A2AServer>(TOKENS.A2AServer);
    const port = config.get('a2a.port', 3001);
    await a2aServer.start(port);
  }

  return {
    container,
    serviceRegistry,
    a2aServer
  };
}
```

### **Fase 1.4: Configuration**

#### **Configuração A2A**
```typescript
// src/core/config/default.ts (adicionar)
export const defaultConfig: AppConfig = {
  // ... existing config ...
  
  a2a: {
    enabled: false,
    port: 3001,
    host: '0.0.0.0',
    cors: {
      origins: ['http://localhost:3000'],
      credentials: true
    },
    auth: {
      jwt_secret: process.env.A2A_JWT_SECRET || 'dev-secret',
      token_expiry: '24h'
    },
    rate_limits: {
      global: {
        requests_per_minute: 100,
        requests_per_hour: 1000
      }
    }
  }
};
```

#### **Environment Variables**
```bash
# .env.a2a.example
A2A_ENABLED=true
A2A_PORT=3001
A2A_HOST=0.0.0.0
A2A_JWT_SECRET=your-super-secure-secret
A2A_BASE_URL=http://localhost:3001/a2a
```

## 🧪 Testing Sprint 1

### **Testes Básicos**
```typescript
// test/a2a/sprint1/A2AServer.test.ts
describe('A2A Server - Sprint 1', () => {
  let server: A2AServer;
  let container: DIContainer;

  beforeEach(async () => {
    container = await createTestContainer();
    server = container.resolve<A2AServer>(TOKENS.A2AServer);
  });

  afterEach(async () => {
    await server.stop();
  });

  describe('Server Lifecycle', () => {
    it('should start and stop successfully', async () => {
      await server.start(3002);
      expect(server.isRunning).toBe(true);
      
      await server.stop();
      expect(server.isRunning).toBe(false);
    });
  });

  describe('Agent Card', () => {
    it('should return valid agent card', async () => {
      await server.start(3002);
      
      const response = await fetch('http://localhost:3002/a2a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'getAgentCard',
          id: 1
        })
      });

      const result = await response.json();
      
      expect(result.jsonrpc).toBe('2.0');
      expect(result.result.name).toBe('WhatsApp Group Scraper');
      expect(result.result.schema_version).toBe('0.0.1a1');
    });
  });

  describe('Authentication', () => {
    it('should require authentication for protected methods', async () => {
      await server.start(3002);
      
      const response = await fetch('http://localhost:3002/a2a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'createTask',
          params: {},
          id: 1
        })
      });

      const result = await response.json();
      
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe(-32001); // Authentication required
    });
  });
});
```

### **Teste de Integração**
```typescript
// test/a2a/sprint1/Integration.test.ts
describe('A2A Integration - Sprint 1', () => {
  it('should integrate with existing DI container', async () => {
    const context = await bootstrapApplication();
    
    expect(context.container).toBeDefined();
    expect(context.a2aServer).toBeDefined();
    
    const logger = context.container.resolve<ILogger>(TOKENS.Logger);
    expect(logger).toBeDefined();
  });

  it('should use existing security system', async () => {
    const container = await createTestContainer();
    const auth = container.resolve<A2AAuthMiddleware>(TOKENS.A2AAuthMiddleware);
    const security = container.resolve<SecurityManager>(TOKENS.SecurityManager);
    
    expect(auth).toBeDefined();
    expect(security).toBeDefined();
  });
});
```

## 📊 Métricas Sprint 1

### **Objetivos de Performance**
- ⚡ Tempo de resposta: < 100ms para getAgentCard
- 🔒 Autenticação: < 50ms para validação JWT
- 💾 Uso de memória: < 50MB adicional
- 🚀 Startup time: < 2s para A2A Server

### **Métricas de Qualidade**
- 📈 Cobertura de testes: > 90%
- 🐛 Zero bugs críticos
- 📝 Documentação completa
- ✅ Todos os testes passando

## 🚀 Entrega Sprint 1

### **Checklist Final**
- [ ] A2A Server iniciando corretamente
- [ ] Agent Card retornado com dados corretos
- [ ] JSON-RPC 2.0 implementado conforme spec
- [ ] Autenticação JWT integrada
- [ ] DI Container configurado
- [ ] Testes unitários passando (>90% cobertura)
- [ ] Documentação atualizada
- [ ] Configuração de ambiente documentada

### **Artefatos de Entrega**
- ✅ Código fonte funcional
- ✅ Testes automatizados
- ✅ Documentação técnica
- ✅ Configuração de ambiente
- ✅ Scripts de deployment

---

**Próximo Sprint**: [Sprint 2 - Capabilities Integration](./A2A_SPRINT_2_CAPABILITIES_INTEGRATION.md)

**Status**: 📋 **Pronto para Implementação**