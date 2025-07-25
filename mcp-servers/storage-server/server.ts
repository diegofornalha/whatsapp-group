import { Server } from '@modelcontextprotocol/server';
import { StdioTransport } from '@modelcontextprotocol/transport-stdio';
import crypto from 'crypto';
import { Database } from './database';

/**
 * MCP Storage Server para WhatsApp Scraper
 * Fornece armazenamento seguro e distribuído
 */
class WhatsAppStorageServer {
  private server: Server;
  private db: Database;
  private encryptionKey: string;

  constructor() {
    this.server = new Server({
      name: 'whatsapp-storage-mcp',
      version: '1.0.0',
      capabilities: {
        tools: true,
        resources: true
      }
    });

    this.db = new Database({
      connectionString: process.env.DATABASE_URL,
      encryption: true
    });

    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    this.setupTools();
  }

  private setupTools() {
    // Tool: Armazenar membro com criptografia
    this.server.addTool({
      name: 'store_member',
      description: 'Armazena dados de membro do WhatsApp com criptografia',
      inputSchema: {
        type: 'object',
        properties: {
          member: {
            type: 'object',
            properties: {
              profileId: { type: 'string' },
              name: { type: 'string' },
              phoneNumber: { type: 'string' },
              description: { type: 'string' },
              source: { type: 'string' }
            },
            required: ['profileId']
          },
          sessionId: { type: 'string' },
          ttl: { type: 'number', default: 2592000 } // 30 dias
        },
        required: ['member']
      },
      handler: async (args) => {
        const encrypted = this.encrypt(JSON.stringify(args.member));
        const result = await this.db.storeMember({
          ...args.member,
          data: encrypted,
          sessionId: args.sessionId,
          expiresAt: new Date(Date.now() + args.ttl * 1000)
        });
        
        return {
          success: true,
          id: result.id,
          encrypted: true,
          expiresAt: result.expiresAt
        };
      }
    });

    // Tool: Buscar membros
    this.server.addTool({
      name: 'search_members',
      description: 'Busca membros armazenados com filtros',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          filters: {
            type: 'object',
            properties: {
              source: { type: 'string' },
              dateFrom: { type: 'string' },
              dateTo: { type: 'string' }
            }
          },
          limit: { type: 'number', default: 100 },
          offset: { type: 'number', default: 0 }
        }
      },
      handler: async (args) => {
        const results = await this.db.searchMembers(args);
        
        // Descriptografar resultados
        const decrypted = results.map(member => ({
          ...member,
          data: this.decrypt(member.data)
        }));
        
        return {
          results: decrypted,
          total: await this.db.countMembers(args),
          limit: args.limit,
          offset: args.offset
        };
      }
    });

    // Tool: Sincronizar dados
    this.server.addTool({
      name: 'sync_data',
      description: 'Sincroniza dados entre dispositivos',
      inputSchema: {
        type: 'object',
        properties: {
          deviceId: { type: 'string' },
          lastSync: { type: 'string' },
          changes: { type: 'array' }
        },
        required: ['deviceId']
      },
      handler: async (args) => {
        // Obter mudanças desde última sincronização
        const serverChanges = await this.db.getChangesSince(args.lastSync);
        
        // Aplicar mudanças do cliente
        if (args.changes?.length > 0) {
          await this.db.applyChanges(args.changes);
        }
        
        // Resolver conflitos
        const resolved = await this.resolveConflicts(args.changes, serverChanges);
        
        return {
          changes: resolved,
          lastSync: new Date().toISOString(),
          conflicts: resolved.filter(c => c.hasConflict)
        };
      }
    });

    // Tool: Backup de dados
    this.server.addTool({
      name: 'create_backup',
      description: 'Cria backup dos dados',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          format: { 
            type: 'string', 
            enum: ['json', 'csv', 'encrypted'],
            default: 'encrypted'
          }
        }
      },
      handler: async (args) => {
        const data = await this.db.getAllData(args.sessionId);
        
        let backup;
        switch (args.format) {
          case 'csv':
            backup = this.convertToCSV(data);
            break;
          case 'json':
            backup = JSON.stringify(data, null, 2);
            break;
          case 'encrypted':
          default:
            backup = this.encrypt(JSON.stringify(data));
        }
        
        const backupId = await this.db.storeBackup({
          data: backup,
          format: args.format,
          sessionId: args.sessionId
        });
        
        return {
          backupId,
          size: backup.length,
          format: args.format,
          createdAt: new Date().toISOString()
        };
      }
    });

    // Resource: Estatísticas de armazenamento
    this.server.addResource({
      uri: 'storage://stats',
      name: 'Estatísticas de Armazenamento',
      description: 'Estatísticas em tempo real do storage',
      mimeType: 'application/json',
      handler: async () => {
        const stats = await this.db.getStats();
        return {
          contents: JSON.stringify({
            totalMembers: stats.totalMembers,
            totalSessions: stats.totalSessions,
            storageUsed: stats.storageUsed,
            averageResponseTime: stats.avgResponseTime,
            uptime: process.uptime()
          }, null, 2)
        };
      }
    });
  }

  private encrypt(data: string): string {
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]);
    return encrypted.toString('base64');
  }

  private decrypt(data: string): any {
    const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data, 'base64')),
      decipher.final()
    ]);
    return JSON.parse(decrypted.toString('utf8'));
  }

  private async resolveConflicts(clientChanges: any[], serverChanges: any[]) {
    // Implementar lógica de resolução de conflitos
    // Por enquanto, servidor tem prioridade
    return serverChanges;
  }

  private convertToCSV(data: any[]): string {
    // Implementar conversão para CSV
    const headers = ['profileId', 'name', 'phoneNumber', 'description', 'source'];
    const csv = [headers.join(',')];
    
    data.forEach(item => {
      const row = headers.map(h => item[h] || '').join(',');
      csv.push(row);
    });
    
    return csv.join('\n');
  }

  async start() {
    const transport = new StdioTransport();
    await this.server.connect(transport);
    console.error('WhatsApp Storage MCP Server started');
  }
}

// Inicializar servidor
const server = new WhatsAppStorageServer();
server.start().catch(console.error);