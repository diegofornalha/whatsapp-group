import { IService, ServiceStatus, HealthCheckResult, ServiceConfig } from '../types/IService';
import { EventBus } from './EventBus';
import { ILogger } from '../types/ILogger';
/**
 * Base Service Abstract Class
 * Provides common functionality for all services
 */
export declare abstract class BaseService implements IService {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    protected config: ServiceConfig;
    protected logger?: ILogger;
    protected eventBus?: EventBus;
    protected state: ServiceStatus['state'];
    protected startTime?: Date;
    protected lastError?: Error;
    protected metadata: Record<string, any>;
    protected retryCount: number;
    protected disposed: boolean;
    constructor(id: string, name: string, version: string, config?: Partial<ServiceConfig>, logger?: ILogger, eventBus?: EventBus);
    /**
     * Initialize the service
     */
    initialize(): Promise<void>;
    /**
     * Start the service
     */
    start(): Promise<void>;
    /**
     * Stop the service
     */
    stop(): Promise<void>;
    /**
     * Check if service is running
     */
    isRunning(): boolean;
    /**
     * Get service status
     */
    getStatus(): ServiceStatus;
    /**
     * Service health check
     */
    healthCheck(): Promise<HealthCheckResult>;
    /**
     * Dispose service resources
     */
    dispose(): Promise<void>;
    /**
     * Protected abstract methods to be implemented by subclasses
     */
    protected abstract onInitialize(): Promise<void>;
    protected abstract onStart(): Promise<void>;
    protected abstract onStop(): Promise<void>;
    protected abstract onHealthCheck(): Promise<HealthCheckResult>;
    protected abstract onDispose(): Promise<void>;
    /**
     * Protected helper methods
     */
    protected setState(state: ServiceStatus['state']): void;
    protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, error?: Error): void;
    protected emitEvent(event: string, data?: any): void;
    protected checkDependencies(): Promise<void>;
    protected handleError(error: Error, operation: string): void;
    protected handleStartError(error: Error): Promise<void>;
    protected calculateRetryDelay(): number;
    protected mergeConfig(config?: Partial<ServiceConfig>): ServiceConfig;
    /**
     * Utility method to wait for a condition
     */
    protected waitForCondition(condition: () => boolean | Promise<boolean>, timeout?: number, interval?: number): Promise<void>;
}
//# sourceMappingURL=BaseService.d.ts.map