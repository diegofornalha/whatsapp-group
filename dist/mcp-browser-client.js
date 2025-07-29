/**
 * MCP Browser Client - Cliente otimizado para uso em extensões de navegador
 * Suporta WebSocket, sincronização em tempo real e operações offline
 */
import { EventEmitter } from 'events';
export class MCPBrowserClient extends EventEmitter {
    constructor(config) {
        super();
        this.ws = null;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.pendingRequests = new Map();
        this.offlineQueue = [];
        this.isConnected = false;
        this.connectionId = null;
        this.config = {
            reconnectDelay: 5000,
            maxReconnectAttempts: 10,
            enableOfflineQueue: true,
            ...config
        };
    }
    /**
     * Conecta ao servidor MCP via WebSocket
     */
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.config.endpoint);
                this.ws.onopen = () => {
                    console.log(`[MCP] Connected to ${this.config.server}`);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.connectionId = this.generateConnectionId();
                    // Autenticar se necessário
                    this.authenticate().then(() => {
                        // Processar fila offline
                        this.processOfflineQueue();
                        this.emit('connected', { server: this.config.server });
                        resolve();
                    }).catch(reject);
                };
                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };
                this.ws.onclose = () => {
                    this.handleDisconnect();
                };
                this.ws.onerror = (error) => {
                    console.error(`[MCP] WebSocket error:`, error);
                    this.emit('error', error);
                    reject(error);
                };
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Desconecta do servidor MCP
     */
    disconnect() {
        this.isConnected = false;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.emit('disconnected');
    }
    /**
     * Chama um método no servidor MCP
     */
    async call(method, params = {}) {
        const request = {
            id: this.generateRequestId(),
            method,
            params,
            timestamp: Date.now()
        };
        // Se offline e queue habilitada, adicionar à fila
        if (!this.isConnected && this.config.enableOfflineQueue) {
            this.offlineQueue.push(request);
            this.emit('queued', { method, queueSize: this.offlineQueue.length });
            return { queued: true, requestId: request.id };
        }
        // Se não conectado e sem queue, rejeitar
        if (!this.isConnected) {
            throw new Error('MCP client not connected');
        }
        return new Promise((resolve, reject) => {
            // Timeout de 30 segundos por padrão
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(request.id);
                reject(new Error(`Request timeout: ${method}`));
            }, 30000);
            this.pendingRequests.set(request.id, { resolve, reject, timeout });
            try {
                this.ws.send(JSON.stringify(request));
                this.emit('request', { method, params });
            }
            catch (error) {
                clearTimeout(timeout);
                this.pendingRequests.delete(request.id);
                reject(error);
            }
        });
    }
    /**
     * Subscreve a eventos do servidor
     */
    subscribe(event, handler) {
        this.on(`server:${event}`, handler);
        // Notificar servidor sobre a subscription
        this.call('subscribe', { event }).catch(console.error);
    }
    /**
     * Cancela subscription
     */
    unsubscribe(event, handler) {
        if (handler) {
            this.off(`server:${event}`, handler);
        }
        else {
            this.removeAllListeners(`server:${event}`);
        }
        // Notificar servidor
        this.call('unsubscribe', { event }).catch(console.error);
    }
    /**
     * Processa mensagem recebida do servidor
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            // Resposta a uma requisição
            if (message.id && this.pendingRequests.has(message.id)) {
                const pending = this.pendingRequests.get(message.id);
                clearTimeout(pending.timeout);
                this.pendingRequests.delete(message.id);
                if (message.error) {
                    pending.reject(message.error);
                }
                else {
                    pending.resolve(message.result);
                }
                return;
            }
            // Evento do servidor
            if (message.event) {
                this.emit(`server:${message.event}`, message.data);
                return;
            }
            // Mensagem não reconhecida
            console.warn('[MCP] Unhandled message:', message);
        }
        catch (error) {
            console.error('[MCP] Error parsing message:', error);
        }
    }
    /**
     * Trata desconexão e tenta reconectar
     */
    handleDisconnect() {
        this.isConnected = false;
        this.emit('disconnected');
        // Limpar requests pendentes
        for (const [id, pending] of this.pendingRequests) {
            clearTimeout(pending.timeout);
            pending.reject(new Error('Connection lost'));
        }
        this.pendingRequests.clear();
        // Tentar reconectar se dentro do limite
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[MCP] Reconnecting... (attempt ${this.reconnectAttempts})`);
            this.reconnectTimer = setTimeout(() => {
                this.connect().catch(console.error);
            }, this.config.reconnectDelay);
        }
        else {
            this.emit('reconnect_failed');
        }
    }
    /**
     * Autentica com o servidor
     */
    async authenticate() {
        if (!this.config.encryptionKey)
            return;
        const result = await this.call('authenticate', {
            connectionId: this.connectionId,
            timestamp: Date.now(),
            // Adicionar outros dados de autenticação conforme necessário
        });
        if (!result.success) {
            throw new Error('Authentication failed');
        }
    }
    /**
     * Processa fila de requisições offline
     */
    async processOfflineQueue() {
        if (this.offlineQueue.length === 0)
            return;
        console.log(`[MCP] Processing ${this.offlineQueue.length} offline requests`);
        const queue = [...this.offlineQueue];
        this.offlineQueue = [];
        for (const request of queue) {
            try {
                await this.call(request.method, request.params);
            }
            catch (error) {
                console.error(`[MCP] Error processing offline request:`, error);
                this.emit('offline_sync_error', { request, error });
            }
        }
        this.emit('offline_sync_complete', { processed: queue.length });
    }
    /**
     * Gera ID único para requisição
     */
    generateRequestId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Gera ID único para conexão
     */
    generateConnectionId() {
        return `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Retorna status da conexão
     */
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            server: this.config.server,
            connectionId: this.connectionId,
            pendingRequests: this.pendingRequests.size,
            offlineQueueSize: this.offlineQueue.length
        };
    }
    /**
     * Métodos de conveniência para operações comuns
     */
    async store(key, value, options) {
        return this.call('store', { key, value, ...options });
    }
    async retrieve(key) {
        return this.call('retrieve', { key });
    }
    async search(query) {
        return this.call('search', query);
    }
    async sync(data) {
        return this.call('sync', data);
    }
    async analytics(operation, data) {
        return this.call('analytics', { operation, data });
    }
}
// Exportar singleton para uso global na extensão
export const mcpClient = {
    storage: null,
    analytics: null,
    async initialize(config) {
        this.storage = new MCPBrowserClient({
            server: 'whatsapp-storage',
            endpoint: config.storageEndpoint,
            encryptionKey: config.encryptionKey
        });
        this.analytics = new MCPBrowserClient({
            server: 'whatsapp-analytics',
            endpoint: config.analyticsEndpoint,
            encryptionKey: config.encryptionKey
        });
        await Promise.all([
            this.storage.connect(),
            this.analytics.connect()
        ]);
    }
};
//# sourceMappingURL=mcp-browser-client.js.map