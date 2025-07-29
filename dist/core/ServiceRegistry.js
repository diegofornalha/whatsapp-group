import { SystemEvents } from './EventBus';
/**
 * Service Registry
 * Manages all application services with lifecycle management
 */
export class ServiceRegistry {
    constructor(logger, eventBus) {
        this.services = new Map();
        this.startOrder = [];
        this.starting = false;
        this.stopping = false;
        this.logger = logger;
        this.eventBus = eventBus;
    }
    /**
     * Register a service
     */
    register(service, dependencies = []) {
        if (this.services.has(service.id)) {
            throw new Error(`Service with ID ${service.id} is already registered`);
        }
        this.services.set(service.id, service);
        this.updateStartOrder(service.id, dependencies);
        this.log('info', `Registered service: ${service.name} (${service.id})`);
    }
    /**
     * Unregister a service
     */
    async unregister(serviceId) {
        const service = this.services.get(serviceId);
        if (!service) {
            throw new Error(`Service with ID ${serviceId} not found`);
        }
        // Stop the service if running
        if (service.isRunning()) {
            await service.stop();
        }
        // Dispose the service
        await service.dispose();
        this.services.delete(serviceId);
        this.startOrder = this.startOrder.filter(id => id !== serviceId);
        this.log('info', `Unregistered service: ${service.name} (${serviceId})`);
    }
    /**
     * Get a service by ID
     */
    get(serviceId) {
        return this.services.get(serviceId);
    }
    /**
     * Get all services
     */
    getAll() {
        return Array.from(this.services.values());
    }
    /**
     * Get services by state
     */
    getByState(state) {
        return this.getAll().filter(service => service.getStatus().state === state);
    }
    /**
     * Initialize all services
     */
    async initializeAll() {
        this.log('info', 'Initializing all services...');
        const errors = [];
        for (const serviceId of this.startOrder) {
            const service = this.services.get(serviceId);
            if (!service)
                continue;
            try {
                await service.initialize();
            }
            catch (error) {
                errors.push({ service: service.name, error: error });
                this.log('error', `Failed to initialize service ${service.name}`, error);
            }
        }
        if (errors.length > 0) {
            throw new Error(`Failed to initialize services:\n${errors
                .map(e => `- ${e.service}: ${e.error.message}`)
                .join('\n')}`);
        }
        this.log('info', 'All services initialized successfully');
    }
    /**
     * Start all services
     */
    async startAll() {
        if (this.starting) {
            throw new Error('Services are already starting');
        }
        if (this.stopping) {
            throw new Error('Cannot start services while stopping');
        }
        this.starting = true;
        this.log('info', 'Starting all services...');
        try {
            const errors = [];
            for (const serviceId of this.startOrder) {
                const service = this.services.get(serviceId);
                if (!service)
                    continue;
                // Check if service should auto-start
                const status = service.getStatus();
                if (status.state !== 'stopped')
                    continue;
                try {
                    await service.start();
                }
                catch (error) {
                    errors.push({ service: service.name, error: error });
                    this.log('error', `Failed to start service ${service.name}`, error);
                    // Stop already started services on error
                    await this.stopStartedServices(serviceId);
                    break;
                }
            }
            if (errors.length > 0) {
                throw new Error(`Failed to start services:\n${errors
                    .map(e => `- ${e.service}: ${e.error.message}`)
                    .join('\n')}`);
            }
            this.log('info', 'All services started successfully');
        }
        finally {
            this.starting = false;
        }
    }
    /**
     * Stop all services
     */
    async stopAll() {
        if (this.stopping) {
            throw new Error('Services are already stopping');
        }
        if (this.starting) {
            throw new Error('Cannot stop services while starting');
        }
        this.stopping = true;
        this.log('info', 'Stopping all services...');
        try {
            const errors = [];
            // Stop in reverse order
            const reverseOrder = [...this.startOrder].reverse();
            for (const serviceId of reverseOrder) {
                const service = this.services.get(serviceId);
                if (!service || !service.isRunning())
                    continue;
                try {
                    await service.stop();
                }
                catch (error) {
                    errors.push({ service: service.name, error: error });
                    this.log('error', `Failed to stop service ${service.name}`, error);
                }
            }
            if (errors.length > 0) {
                console.error(`Errors occurred while stopping services:\n${errors
                    .map(e => `- ${e.service}: ${e.error.message}`)
                    .join('\n')}`);
            }
            this.log('info', 'All services stopped');
        }
        finally {
            this.stopping = false;
        }
    }
    /**
     * Restart all services
     */
    async restartAll() {
        await this.stopAll();
        await this.startAll();
    }
    /**
     * Get status of all services
     */
    getAllStatus() {
        const status = {};
        for (const [id, service] of this.services) {
            status[id] = service.getStatus();
        }
        return status;
    }
    /**
     * Perform health check on all services
     */
    async healthCheckAll() {
        const results = {};
        const promises = [];
        for (const [id, service] of this.services) {
            promises.push(service
                .healthCheck()
                .then(result => {
                results[id] = result;
            })
                .catch(error => {
                results[id] = {
                    healthy: false,
                    message: `Health check failed: ${error.message}`,
                    timestamp: new Date(),
                };
            }));
        }
        await Promise.all(promises);
        return results;
    }
    /**
     * Check if all services are healthy
     */
    async isHealthy() {
        const results = await this.healthCheckAll();
        return Object.values(results).every(result => result.healthy);
    }
    /**
     * Dispose all services
     */
    async disposeAll() {
        this.log('info', 'Disposing all services...');
        // Stop all services first
        await this.stopAll();
        const errors = [];
        // Dispose in reverse order
        const reverseOrder = [...this.startOrder].reverse();
        for (const serviceId of reverseOrder) {
            const service = this.services.get(serviceId);
            if (!service)
                continue;
            try {
                await service.dispose();
            }
            catch (error) {
                errors.push({ service: service.name, error: error });
                this.log('error', `Failed to dispose service ${service.name}`, error);
            }
        }
        // Clear registry
        this.services.clear();
        this.startOrder = [];
        if (errors.length > 0) {
            console.error(`Errors occurred while disposing services:\n${errors
                .map(e => `- ${e.service}: ${e.error.message}`)
                .join('\n')}`);
        }
        this.log('info', 'All services disposed');
    }
    /**
     * Get service dependencies
     */
    getDependencies(serviceId) {
        // This would need to be enhanced to track actual dependencies
        return [];
    }
    /**
     * Get dependent services
     */
    getDependents(serviceId) {
        // This would need to be enhanced to track actual dependents
        return [];
    }
    /**
     * Private helper methods
     */
    updateStartOrder(serviceId, dependencies) {
        // Simple topological sort - could be enhanced
        // For now, just ensure dependencies come before the service
        const index = this.startOrder.indexOf(serviceId);
        if (index !== -1) {
            this.startOrder.splice(index, 1);
        }
        // Find the latest dependency index
        let insertIndex = 0;
        for (const dep of dependencies) {
            const depIndex = this.startOrder.indexOf(dep);
            if (depIndex !== -1 && depIndex >= insertIndex) {
                insertIndex = depIndex + 1;
            }
        }
        this.startOrder.splice(insertIndex, 0, serviceId);
    }
    async stopStartedServices(failedServiceId) {
        const failedIndex = this.startOrder.indexOf(failedServiceId);
        if (failedIndex === -1)
            return;
        // Stop services that were started before the failed one
        const toStop = this.startOrder.slice(0, failedIndex).reverse();
        for (const serviceId of toStop) {
            const service = this.services.get(serviceId);
            if (service && service.isRunning()) {
                try {
                    await service.stop();
                }
                catch (error) {
                    this.log('error', `Failed to stop service ${service.name} during rollback`, error);
                }
            }
        }
    }
    log(level, message, error) {
        if (!this.logger)
            return;
        const context = { module: 'ServiceRegistry' };
        if (level === 'error' && error) {
            this.logger.error(message, error, context);
        }
        else {
            this.logger.info(message, context);
        }
        // Emit events
        if (this.eventBus) {
            if (level === 'error') {
                this.eventBus.emit(SystemEvents.ERROR, { message, error });
            }
        }
    }
    /**
     * Get service statistics
     */
    getStatistics() {
        const stats = {
            total: this.services.size,
            running: 0,
            stopped: 0,
            error: 0,
            starting: 0,
            stopping: 0,
        };
        for (const service of this.services.values()) {
            const state = service.getStatus().state;
            stats[state]++;
        }
        return stats;
    }
}
//# sourceMappingURL=ServiceRegistry.js.map