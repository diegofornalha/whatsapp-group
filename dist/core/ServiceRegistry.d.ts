import { IService, ServiceStatus, HealthCheckResult } from '../types/IService';
import { EventBus } from './EventBus';
import { ILogger } from '../types/ILogger';
/**
 * Service Registry
 * Manages all application services with lifecycle management
 */
export declare class ServiceRegistry {
    private services;
    private startOrder;
    private logger?;
    private eventBus?;
    private starting;
    private stopping;
    constructor(logger?: ILogger, eventBus?: EventBus);
    /**
     * Register a service
     */
    register(service: IService, dependencies?: string[]): void;
    /**
     * Unregister a service
     */
    unregister(serviceId: string): Promise<void>;
    /**
     * Get a service by ID
     */
    get<T extends IService = IService>(serviceId: string): T | undefined;
    /**
     * Get all services
     */
    getAll(): IService[];
    /**
     * Get services by state
     */
    getByState(state: ServiceStatus['state']): IService[];
    /**
     * Initialize all services
     */
    initializeAll(): Promise<void>;
    /**
     * Start all services
     */
    startAll(): Promise<void>;
    /**
     * Stop all services
     */
    stopAll(): Promise<void>;
    /**
     * Restart all services
     */
    restartAll(): Promise<void>;
    /**
     * Get status of all services
     */
    getAllStatus(): Record<string, ServiceStatus>;
    /**
     * Perform health check on all services
     */
    healthCheckAll(): Promise<Record<string, HealthCheckResult>>;
    /**
     * Check if all services are healthy
     */
    isHealthy(): Promise<boolean>;
    /**
     * Dispose all services
     */
    disposeAll(): Promise<void>;
    /**
     * Get service dependencies
     */
    getDependencies(serviceId: string): string[];
    /**
     * Get dependent services
     */
    getDependents(serviceId: string): string[];
    /**
     * Private helper methods
     */
    private updateStartOrder;
    private stopStartedServices;
    private log;
    /**
     * Get service statistics
     */
    getStatistics(): {
        total: number;
        running: number;
        stopped: number;
        error: number;
        starting: number;
        stopping: number;
    };
}
//# sourceMappingURL=ServiceRegistry.d.ts.map