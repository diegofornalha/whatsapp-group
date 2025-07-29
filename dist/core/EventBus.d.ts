/**
 * EventBus for inter-module communication
 * Implements a type-safe event system with support for wildcards and async handlers
 */
export type EventHandler<T = any> = (data: T) => void | Promise<void>;
export type EventUnsubscribe = () => void;
export interface EventSubscription {
    id: string;
    event: string;
    handler: EventHandler;
    once: boolean;
    priority: number;
}
export interface EventBusOptions {
    maxListeners?: number;
    wildcardDelimiter?: string;
    enableLogging?: boolean;
    asyncHandlers?: boolean;
}
export declare class EventBus {
    private subscriptions;
    private wildcardSubscriptions;
    private eventHistory;
    private options;
    private subscriptionIdCounter;
    constructor(options?: EventBusOptions);
    /**
     * Subscribe to an event
     */
    on<T = any>(event: string, handler: EventHandler<T>, priority?: number): EventUnsubscribe;
    /**
     * Subscribe to an event once
     */
    once<T = any>(event: string, handler: EventHandler<T>, priority?: number): EventUnsubscribe;
    /**
     * Unsubscribe from an event
     */
    off(event: string, handler?: EventHandler): void;
    /**
     * Emit an event
     */
    emit<T = any>(event: string, data?: T): Promise<void>;
    /**
     * Emit an event synchronously
     */
    emitSync<T = any>(event: string, data?: T): void;
    /**
     * Wait for an event
     */
    waitFor<T = any>(event: string, timeout?: number): Promise<T>;
    /**
     * Get all listeners for an event
     */
    listeners(event: string): EventHandler[];
    /**
     * Get listener count for an event
     */
    listenerCount(event: string): number;
    /**
     * Remove all listeners
     */
    removeAllListeners(event?: string): void;
    /**
     * Get event history
     */
    getEventHistory(limit?: number): Array<{
        event: string;
        data: any;
        timestamp: Date;
    }>;
    /**
     * Clear event history
     */
    clearEventHistory(): void;
    /**
     * Private helper methods
     */
    private addSubscription;
    private removeSubscription;
    private executeHandler;
    private matchWildcard;
    private generateSubscriptionId;
}
export declare const globalEventBus: EventBus;
export declare enum SystemEvents {
    SERVICE_STARTED = "service.started",
    SERVICE_STOPPED = "service.stopped",
    SERVICE_ERROR = "service.error",
    SERVICE_HEALTH_CHECK = "service.health_check",
    WHATSAPP_READY = "whatsapp.ready",
    WHATSAPP_QR = "whatsapp.qr",
    WHATSAPP_AUTHENTICATED = "whatsapp.authenticated",
    WHATSAPP_DISCONNECTED = "whatsapp.disconnected",
    WHATSAPP_MESSAGE = "whatsapp.message",
    EXTRACTION_STARTED = "extraction.started",
    EXTRACTION_PROGRESS = "extraction.progress",
    EXTRACTION_COMPLETED = "extraction.completed",
    EXTRACTION_ERROR = "extraction.error",
    EXPORT_STARTED = "export.started",
    EXPORT_COMPLETED = "export.completed",
    EXPORT_ERROR = "export.error",
    CONFIG_CHANGED = "config.changed",
    ERROR = "error",
    WARNING = "warning"
}
//# sourceMappingURL=EventBus.d.ts.map