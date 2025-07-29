/**
 * MCP Browser Client - Cliente otimizado para uso em extensões de navegador
 * Suporta WebSocket, sincronização em tempo real e operações offline
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
interface MCPBrowserClientConfig {
    server: string;
    endpoint: string;
    reconnectDelay?: number;
    maxReconnectAttempts?: number;
    enableOfflineQueue?: boolean;
    encryptionKey?: string;
}
export declare class MCPBrowserClient extends EventEmitter {
    private config;
    private ws;
    private reconnectAttempts;
    private reconnectTimer;
    private pendingRequests;
    private offlineQueue;
    private isConnected;
    private connectionId;
    constructor(config: MCPBrowserClientConfig);
    /**
     * Conecta ao servidor MCP via WebSocket
     */
    connect(): Promise<void>;
    /**
     * Desconecta do servidor MCP
     */
    disconnect(): void;
    /**
     * Chama um método no servidor MCP
     */
    call(method: string, params?: any): Promise<any>;
    /**
     * Subscreve a eventos do servidor
     */
    subscribe(event: string, handler: (data: any) => void): void;
    /**
     * Cancela subscription
     */
    unsubscribe(event: string, handler?: (data: any) => void): void;
    /**
     * Processa mensagem recebida do servidor
     */
    private handleMessage;
    /**
     * Trata desconexão e tenta reconectar
     */
    private handleDisconnect;
    /**
     * Autentica com o servidor
     */
    private authenticate;
    /**
     * Processa fila de requisições offline
     */
    private processOfflineQueue;
    /**
     * Gera ID único para requisição
     */
    private generateRequestId;
    /**
     * Gera ID único para conexão
     */
    private generateConnectionId;
    /**
     * Retorna status da conexão
     */
    getConnectionStatus(): {
        connected: boolean;
        server: string;
        connectionId: string | null;
        pendingRequests: number;
        offlineQueueSize: number;
    };
    /**
     * Métodos de conveniência para operações comuns
     */
    store(key: string, value: any, options?: {
        ttl?: number;
        encrypted?: boolean;
    }): Promise<any>;
    retrieve(key: string): Promise<any>;
    search(query: any): Promise<any>;
    sync(data: any): Promise<any>;
    analytics(operation: string, data: any): Promise<any>;
}
export declare const mcpClient: {
    storage: MCPBrowserClient | null;
    analytics: MCPBrowserClient | null;
    initialize(config: {
        storageEndpoint: string;
        analyticsEndpoint: string;
        encryptionKey?: string;
    }): Promise<void>;
};
export {};
//# sourceMappingURL=mcp-browser-client.d.ts.map