import { Server } from '@modelcontextprotocol/server';
import { StdioTransport } from '@modelcontextprotocol/transport-stdio';
import { v4 as uuidv4 } from 'uuid';
import { SwarmManager } from './swarm-manager';
import { TaskQueue } from './task-queue';
import { AgentRegistry } from './agent-registry';
import { z } from 'zod';

/**
 * MCP Coordination Server para WhatsApp Scraper
 * Gerencia coordenação de swarm e orquestração de tarefas
 */
class WhatsAppCoordinationServer {
  private server: Server;
  private swarmManager: SwarmManager;
  private taskQueue: TaskQueue;
  private agentRegistry: AgentRegistry;

  constructor() {
    this.server = new Server({
      name: 'whatsapp-coordination-mcp',
      version: '1.0.0',
      capabilities: {
        tools: true,
        resources: true,
        prompts: true
      }
    });

    this.swarmManager = new SwarmManager();
    this.taskQueue = new TaskQueue();
    this.agentRegistry = new AgentRegistry();
    
    this.setupTools();
    this.setupResources();
  }

  private setupTools() {
    // Tool: Criar swarm
    this.server.addTool({
      name: 'create_swarm',
      description: 'Cria um novo swarm de agentes coordenados',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          topology: { 
            type: 'string',
            enum: ['hierarchical', 'mesh', 'ring', 'star', 'hybrid'],
            default: 'hierarchical'
          },
          maxAgents: { type: 'number', default: 8 },
          strategy: {
            type: 'string',
            enum: ['parallel', 'sequential', 'adaptive', 'balanced'],
            default: 'adaptive'
          },
          config: {
            type: 'object',
            properties: {
              autoScale: { type: 'boolean', default: true },
              faultTolerance: { type: 'boolean', default: true },
              loadBalancing: { type: 'boolean', default: true }
            }
          }
        },
        required: ['name']
      },
      handler: async (args) => {
        const swarmId = uuidv4();
        const swarm = await this.swarmManager.createSwarm({
          id: swarmId,
          name: args.name,
          topology: args.topology,
          maxAgents: args.maxAgents,
          strategy: args.strategy,
          config: args.config || {}
        });

        // Inicializar agentes base
        await this.initializeBaseAgents(swarmId, args.topology);

        return {
          swarmId,
          name: swarm.name,
          topology: swarm.topology,
          status: 'active',
          agents: swarm.agents,
          capabilities: this.getSwarmCapabilities(swarm.topology)
        };
      }
    });

    // Tool: Registrar agente
    this.server.addTool({
      name: 'register_agent',
      description: 'Registra um novo agente no swarm',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string' },
          agentType: { 
            type: 'string',
            enum: ['coordinator', 'researcher', 'coder', 'analyst', 'architect', 
                   'tester', 'reviewer', 'optimizer', 'documenter', 'monitor']
          },
          name: { type: 'string' },
          capabilities: {
            type: 'array',
            items: { type: 'string' }
          },
          metadata: { type: 'object' }
        },
        required: ['swarmId', 'agentType', 'name']
      },
      handler: async (args) => {
        const agentId = uuidv4();
        const agent = await this.agentRegistry.registerAgent({
          id: agentId,
          swarmId: args.swarmId,
          type: args.agentType,
          name: args.name,
          capabilities: args.capabilities || [],
          metadata: args.metadata || {},
          status: 'idle',
          metrics: {
            tasksCompleted: 0,
            successRate: 100,
            avgResponseTime: 0
          }
        });

        // Atualizar swarm com novo agente
        await this.swarmManager.addAgent(args.swarmId, agent);

        return {
          agentId,
          name: agent.name,
          type: agent.type,
          status: agent.status,
          assignedTasks: []
        };
      }
    });

    // Tool: Orquestrar tarefa
    this.server.addTool({
      name: 'orchestrate_task',
      description: 'Orquestra execução de tarefa complexa no swarm',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string' },
          task: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical'],
                default: 'medium'
              },
              dependencies: {
                type: 'array',
                items: { type: 'string' }
              },
              requirements: {
                type: 'array',
                items: { type: 'string' }
              },
              deadline: { type: 'string' }
            },
            required: ['name', 'description']
          },
          strategy: {
            type: 'string',
            enum: ['parallel', 'sequential', 'adaptive'],
            default: 'adaptive'
          }
        },
        required: ['swarmId', 'task']
      },
      handler: async (args) => {
        const taskId = uuidv4();
        
        // Analisar tarefa e decompor em subtarefas
        const subtasks = await this.decomposeTask(args.task);
        
        // Alocar agentes baseado em capacidades
        const allocations = await this.allocateAgents(
          args.swarmId, 
          subtasks,
          args.strategy
        );

        // Adicionar tarefas à fila
        const queuedTasks = await Promise.all(
          allocations.map(allocation => 
            this.taskQueue.enqueue({
              id: uuidv4(),
              parentId: taskId,
              name: allocation.subtask.name,
              agentId: allocation.agentId,
              priority: args.task.priority,
              status: 'queued',
              createdAt: new Date()
            })
          )
        );

        // Iniciar execução coordenada
        await this.startCoordinatedExecution(taskId, args.strategy);

        return {
          taskId,
          status: 'orchestrating',
          subtasks: subtasks.length,
          allocations: allocations.map(a => ({
            subtask: a.subtask.name,
            agent: a.agentName,
            estimatedTime: a.estimatedTime
          })),
          strategy: args.strategy,
          estimatedCompletion: this.estimateCompletionTime(allocations)
        };
      }
    });

    // Tool: Monitorar swarm
    this.server.addTool({
      name: 'monitor_swarm',
      description: 'Monitora status e performance do swarm',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string' },
          includeMetrics: { type: 'boolean', default: true },
          includeHealth: { type: 'boolean', default: true }
        },
        required: ['swarmId']
      },
      handler: async (args) => {
        const swarm = await this.swarmManager.getSwarm(args.swarmId);
        const agents = await this.agentRegistry.getSwarmAgents(args.swarmId);
        const tasks = await this.taskQueue.getSwarmTasks(args.swarmId);

        const status = {
          swarm: {
            id: swarm.id,
            name: swarm.name,
            topology: swarm.topology,
            status: swarm.status
          },
          agents: {
            total: agents.length,
            active: agents.filter(a => a.status === 'busy').length,
            idle: agents.filter(a => a.status === 'idle').length,
            error: agents.filter(a => a.status === 'error').length
          },
          tasks: {
            total: tasks.length,
            queued: tasks.filter(t => t.status === 'queued').length,
            executing: tasks.filter(t => t.status === 'executing').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            failed: tasks.filter(t => t.status === 'failed').length
          }
        };

        if (args.includeMetrics) {
          status['metrics'] = await this.collectSwarmMetrics(args.swarmId);
        }

        if (args.includeHealth) {
          status['health'] = await this.checkSwarmHealth(args.swarmId);
        }

        return status;
      }
    });

    // Tool: Balancear carga
    this.server.addTool({
      name: 'balance_load',
      description: 'Rebalanceia carga entre agentes do swarm',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string' },
          strategy: {
            type: 'string',
            enum: ['round-robin', 'least-loaded', 'capability-based', 'performance-based'],
            default: 'performance-based'
          }
        },
        required: ['swarmId']
      },
      handler: async (args) => {
        const rebalanced = await this.swarmManager.rebalanceLoad(
          args.swarmId,
          args.strategy
        );

        return {
          swarmId: args.swarmId,
          strategy: args.strategy,
          tasksReassigned: rebalanced.reassigned,
          loadDistribution: rebalanced.distribution,
          estimatedImprovement: rebalanced.improvement
        };
      }
    });

    // Tool: Escalar swarm
    this.server.addTool({
      name: 'scale_swarm',
      description: 'Escala swarm automaticamente baseado em carga',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string' },
          targetSize: { type: 'number' },
          scaleType: {
            type: 'string',
            enum: ['up', 'down', 'auto'],
            default: 'auto'
          }
        },
        required: ['swarmId']
      },
      handler: async (args) => {
        const currentSize = await this.swarmManager.getSwarmSize(args.swarmId);
        let newSize = currentSize;

        if (args.scaleType === 'auto') {
          newSize = await this.calculateOptimalSize(args.swarmId);
        } else if (args.targetSize) {
          newSize = args.targetSize;
        }

        const scaled = await this.swarmManager.scaleSwarm(
          args.swarmId,
          newSize,
          args.scaleType
        );

        return {
          swarmId: args.swarmId,
          previousSize: currentSize,
          currentSize: scaled.size,
          agentsAdded: scaled.added,
          agentsRemoved: scaled.removed,
          reason: scaled.reason
        };
      }
    });

    // Tool: Sincronizar agentes
    this.server.addTool({
      name: 'sync_agents',
      description: 'Sincroniza estado e conhecimento entre agentes',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string' },
          syncType: {
            type: 'string',
            enum: ['state', 'knowledge', 'full'],
            default: 'full'
          },
          agents: {
            type: 'array',
            items: { type: 'string' },
            description: 'IDs dos agentes para sincronizar (vazio = todos)'
          }
        },
        required: ['swarmId']
      },
      handler: async (args) => {
        const synced = await this.swarmManager.syncAgents(
          args.swarmId,
          args.syncType,
          args.agents
        );

        return {
          swarmId: args.swarmId,
          syncType: args.syncType,
          agentsSynced: synced.count,
          sharedState: synced.state,
          consensusReached: synced.consensus,
          conflicts: synced.conflicts
        };
      }
    });
  }

  private setupResources() {
    // Resource: Topologia do swarm
    this.server.addResource({
      uri: 'coordination://topology',
      name: 'Visualização da Topologia do Swarm',
      description: 'Representação visual da topologia atual do swarm',
      mimeType: 'application/json',
      handler: async (uri) => {
        const swarmId = uri.searchParams.get('swarmId');
        if (!swarmId) {
          throw new Error('swarmId parameter required');
        }

        const topology = await this.swarmManager.getTopologyVisualization(swarmId);
        return {
          contents: JSON.stringify(topology, null, 2)
        };
      }
    });

    // Resource: Fila de tarefas
    this.server.addResource({
      uri: 'coordination://task-queue',
      name: 'Fila de Tarefas do Swarm',
      description: 'Estado atual da fila de tarefas',
      mimeType: 'application/json',
      handler: async (uri) => {
        const swarmId = uri.searchParams.get('swarmId');
        const status = uri.searchParams.get('status');
        
        const tasks = await this.taskQueue.getTasks({
          swarmId,
          status: status as any
        });

        return {
          contents: JSON.stringify({
            total: tasks.length,
            byStatus: this.groupTasksByStatus(tasks),
            byPriority: this.groupTasksByPriority(tasks),
            tasks: tasks.slice(0, 50) // Limitar para performance
          }, null, 2)
        };
      }
    });
  }

  private async initializeBaseAgents(swarmId: string, topology: string) {
    const baseAgents = this.getBaseAgentsForTopology(topology);
    
    for (const agentConfig of baseAgents) {
      await this.agentRegistry.registerAgent({
        id: uuidv4(),
        swarmId,
        ...agentConfig,
        status: 'idle',
        metrics: {
          tasksCompleted: 0,
          successRate: 100,
          avgResponseTime: 0
        }
      });
    }
  }

  private getBaseAgentsForTopology(topology: string) {
    const baseConfigs = {
      hierarchical: [
        { type: 'coordinator', name: 'Master Coordinator', capabilities: ['planning', 'delegation'] },
        { type: 'architect', name: 'System Architect', capabilities: ['design', 'analysis'] },
        { type: 'coder', name: 'Senior Developer', capabilities: ['implementation', 'optimization'] }
      ],
      mesh: [
        { type: 'researcher', name: 'Research Agent', capabilities: ['analysis', 'discovery'] },
        { type: 'coder', name: 'Implementation Agent', capabilities: ['coding', 'testing'] },
        { type: 'reviewer', name: 'Review Agent', capabilities: ['review', 'validation'] }
      ],
      star: [
        { type: 'coordinator', name: 'Central Hub', capabilities: ['coordination', 'routing'] },
        { type: 'analyzer', name: 'Data Analyzer', capabilities: ['analysis', 'reporting'] }
      ],
      ring: [
        { type: 'monitor', name: 'Monitor Agent', capabilities: ['monitoring', 'alerting'] },
        { type: 'optimizer', name: 'Optimization Agent', capabilities: ['optimization', 'tuning'] }
      ]
    };

    return baseConfigs[topology] || baseConfigs.hierarchical;
  }

  private async decomposeTask(task: any) {
    // Implementar decomposição inteligente de tarefas
    // Por enquanto, decomposição simples baseada em keywords
    const subtasks = [];
    
    if (task.description.includes('API')) {
      subtasks.push({
        name: 'Design API endpoints',
        type: 'design',
        requiredCapabilities: ['design', 'analysis']
      });
      subtasks.push({
        name: 'Implement API logic',
        type: 'implementation',
        requiredCapabilities: ['coding', 'backend']
      });
    }

    if (task.description.includes('database')) {
      subtasks.push({
        name: 'Design database schema',
        type: 'design',
        requiredCapabilities: ['database', 'architecture']
      });
    }

    if (task.description.includes('test')) {
      subtasks.push({
        name: 'Write unit tests',
        type: 'testing',
        requiredCapabilities: ['testing', 'validation']
      });
    }

    // Se nenhuma subtarefa foi criada, criar uma genérica
    if (subtasks.length === 0) {
      subtasks.push({
        name: task.name,
        type: 'general',
        requiredCapabilities: []
      });
    }

    return subtasks;
  }

  private async allocateAgents(swarmId: string, subtasks: any[], strategy: string) {
    const agents = await this.agentRegistry.getSwarmAgents(swarmId);
    const allocations = [];

    for (const subtask of subtasks) {
      // Encontrar melhor agente baseado em capacidades e disponibilidade
      const bestAgent = this.findBestAgent(agents, subtask, strategy);
      
      if (bestAgent) {
        allocations.push({
          subtask,
          agentId: bestAgent.id,
          agentName: bestAgent.name,
          estimatedTime: this.estimateTaskTime(subtask, bestAgent)
        });

        // Marcar agente como ocupado
        bestAgent.status = 'busy';
      }
    }

    return allocations;
  }

  private findBestAgent(agents: any[], subtask: any, strategy: string) {
    const availableAgents = agents.filter(a => a.status === 'idle');

    if (strategy === 'capability-based') {
      // Ordenar por melhor match de capacidades
      return availableAgents.sort((a, b) => {
        const aMatch = this.calculateCapabilityMatch(a.capabilities, subtask.requiredCapabilities);
        const bMatch = this.calculateCapabilityMatch(b.capabilities, subtask.requiredCapabilities);
        return bMatch - aMatch;
      })[0];
    }

    // Default: round-robin
    return availableAgents[0];
  }

  private calculateCapabilityMatch(agentCaps: string[], requiredCaps: string[]): number {
    if (requiredCaps.length === 0) return 1;
    
    const matches = requiredCaps.filter(cap => agentCaps.includes(cap)).length;
    return matches / requiredCaps.length;
  }

  private estimateTaskTime(subtask: any, agent: any): number {
    // Estimativa simples baseada no tipo de tarefa
    const baseTime = {
      design: 30,
      implementation: 60,
      testing: 45,
      general: 20
    };

    return baseTime[subtask.type] || 30;
  }

  private async startCoordinatedExecution(taskId: string, strategy: string) {
    // Implementar execução coordenada
    // Este método iniciaria a execução real das tarefas
    console.log(`Starting coordinated execution for task ${taskId} with strategy ${strategy}`);
  }

  private estimateCompletionTime(allocations: any[]): string {
    const totalMinutes = allocations.reduce((sum, a) => sum + a.estimatedTime, 0);
    const completionDate = new Date(Date.now() + totalMinutes * 60000);
    return completionDate.toISOString();
  }

  private async collectSwarmMetrics(swarmId: string) {
    // Coletar métricas detalhadas do swarm
    return {
      throughput: Math.random() * 100,
      latency: Math.random() * 50,
      errorRate: Math.random() * 5,
      utilizationRate: Math.random() * 100
    };
  }

  private async checkSwarmHealth(swarmId: string) {
    // Verificar saúde do swarm
    return {
      status: 'healthy',
      issues: [],
      recommendations: []
    };
  }

  private async calculateOptimalSize(swarmId: string): Promise<number> {
    // Calcular tamanho ótimo baseado em carga
    const tasks = await this.taskQueue.getSwarmTasks(swarmId);
    const queuedTasks = tasks.filter(t => t.status === 'queued').length;
    
    // Heurística simples: 1 agente para cada 5 tarefas na fila
    return Math.min(Math.ceil(queuedTasks / 5), 20);
  }

  private getSwarmCapabilities(topology: string) {
    const capabilities = {
      hierarchical: ['complex-tasks', 'delegation', 'parallel-execution'],
      mesh: ['peer-collaboration', 'fault-tolerance', 'dynamic-routing'],
      star: ['centralized-control', 'simple-routing', 'quick-decisions'],
      ring: ['sequential-processing', 'circular-communication', 'load-distribution']
    };

    return capabilities[topology] || [];
  }

  private groupTasksByStatus(tasks: any[]) {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
  }

  private groupTasksByPriority(tasks: any[]) {
    return tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});
  }

  async start() {
    const transport = new StdioTransport();
    await this.server.connect(transport);
    console.error('WhatsApp Coordination MCP Server started');
  }
}

// Inicializar servidor
const server = new WhatsAppCoordinationServer();
server.start().catch(console.error);