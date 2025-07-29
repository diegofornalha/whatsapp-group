/**
 * Dependency Injection Container
 * Provides a lightweight, type-safe dependency injection system
 */
export class DIContainer {
    constructor(options = {}) {
        this.services = new Map();
        this.instances = new Map();
        this.resolving = new Set();
        this.parent = options.parent;
        this.options = {
            parent: options.parent,
            autoRegister: options.autoRegister ?? false,
            enableLogging: options.enableLogging ?? false,
        };
    }
    /**
     * Register a service
     */
    register(descriptor) {
        if (this.options.enableLogging) {
            console.log(`Registering service: ${this.tokenToString(descriptor.token)}`);
        }
        this.services.set(descriptor.token, descriptor);
        // Clear any existing instance if re-registering
        this.instances.delete(descriptor.token);
        return this;
    }
    /**
     * Register a class
     */
    registerClass(token, constructor, options) {
        return this.register({
            token,
            useClass: constructor,
            singleton: options?.singleton ?? true,
            dependencies: options?.dependencies,
        });
    }
    /**
     * Register a value
     */
    registerValue(token, value) {
        return this.register({
            token,
            useValue: value,
            singleton: true,
        });
    }
    /**
     * Register a factory
     */
    registerFactory(token, factory, options) {
        return this.register({
            token,
            useFactory: factory,
            singleton: options?.singleton ?? false,
        });
    }
    /**
     * Register with decorator metadata (for use with decorators)
     */
    registerWithMetadata(constructor) {
        const metadata = Reflect.getMetadata('design:paramtypes', constructor) || [];
        const dependencies = metadata.map((type, index) => {
            // Check for custom inject metadata
            const injectToken = Reflect.getMetadata('inject', constructor, index);
            return injectToken || type;
        });
        return this.registerClass(constructor, constructor, { dependencies });
    }
    /**
     * Resolve a service
     */
    async resolve(token) {
        // Check for circular dependencies
        if (this.resolving.has(token)) {
            throw new Error(`Circular dependency detected: ${this.tokenToString(token)}`);
        }
        // Check if instance already exists
        if (this.instances.has(token)) {
            return this.instances.get(token);
        }
        // Check if service is registered
        const descriptor = this.services.get(token);
        if (!descriptor) {
            // Try parent container
            if (this.parent) {
                return this.parent.resolve(token);
            }
            // Auto-register if enabled and token is a constructor
            if (this.options.autoRegister && typeof token === 'function') {
                this.registerWithMetadata(token);
                return this.resolve(token);
            }
            throw new Error(`Service not registered: ${this.tokenToString(token)}`);
        }
        this.resolving.add(token);
        try {
            let instance;
            if (descriptor.useValue !== undefined) {
                instance = descriptor.useValue;
            }
            else if (descriptor.useFactory) {
                instance = await descriptor.useFactory(this);
            }
            else if (descriptor.useExisting) {
                instance = await this.resolve(descriptor.useExisting);
            }
            else if (descriptor.useClass) {
                instance = await this.createInstance(descriptor.useClass, descriptor.dependencies);
            }
            else {
                throw new Error(`Invalid service descriptor for: ${this.tokenToString(token)}`);
            }
            // Store instance if singleton
            if (descriptor.singleton !== false) {
                this.instances.set(token, instance);
            }
            if (this.options.enableLogging) {
                console.log(`Resolved service: ${this.tokenToString(token)}`);
            }
            return instance;
        }
        finally {
            this.resolving.delete(token);
        }
    }
    /**
     * Resolve a service synchronously (throws if async resolution is needed)
     */
    resolveSync(token) {
        if (this.instances.has(token)) {
            return this.instances.get(token);
        }
        const descriptor = this.services.get(token);
        if (!descriptor) {
            if (this.parent) {
                return this.parent.resolveSync(token);
            }
            throw new Error(`Service not registered: ${this.tokenToString(token)}`);
        }
        if (descriptor.useFactory) {
            throw new Error(`Cannot resolve factory synchronously: ${this.tokenToString(token)}`);
        }
        // For sync resolution, we can't use async factories
        const result = this.resolve(token);
        if (result instanceof Promise) {
            throw new Error(`Cannot resolve async service synchronously: ${this.tokenToString(token)}`);
        }
        return result;
    }
    /**
     * Check if a service is registered
     */
    has(token) {
        return this.services.has(token) || (this.parent?.has(token) ?? false);
    }
    /**
     * Get all registered services
     */
    getServices() {
        const services = Array.from(this.services.keys());
        if (this.parent) {
            services.push(...this.parent.getServices());
        }
        return Array.from(new Set(services));
    }
    /**
     * Clear all services and instances
     */
    clear() {
        this.services.clear();
        this.instances.clear();
        this.resolving.clear();
    }
    /**
     * Create a child container
     */
    createChild() {
        return new DIContainer({
            parent: this,
            autoRegister: this.options.autoRegister,
            enableLogging: this.options.enableLogging,
        });
    }
    /**
     * Dispose of all singleton instances
     */
    async dispose() {
        for (const [token, instance] of this.instances) {
            if (instance && typeof instance.dispose === 'function') {
                try {
                    await instance.dispose();
                }
                catch (error) {
                    console.error(`Error disposing ${this.tokenToString(token)}:`, error);
                }
            }
        }
        this.clear();
    }
    /**
     * Private helper methods
     */
    async createInstance(constructor, dependencies) {
        const deps = dependencies || this.getDependencies(constructor);
        const resolvedDeps = await Promise.all(deps.map(dep => this.resolve(dep)));
        return new constructor(...resolvedDeps);
    }
    getDependencies(constructor) {
        // Try to get dependencies from Reflect metadata
        const types = Reflect.getMetadata('design:paramtypes', constructor) || [];
        return types.map((type, index) => {
            // Check for custom inject metadata
            const injectToken = Reflect.getMetadata('inject', constructor, index);
            return injectToken || type;
        });
    }
    tokenToString(token) {
        if (typeof token === 'symbol') {
            return token.toString();
        }
        if (typeof token === 'string') {
            return token;
        }
        if (typeof token === 'function') {
            return token.name || 'Anonymous';
        }
        return String(token);
    }
}
// Global container instance
export const globalContainer = new DIContainer({
    autoRegister: true,
    enableLogging: process.env.NODE_ENV === 'development',
});
// Decorators for easier usage (requires reflect-metadata)
export function Injectable(options) {
    return function (target) {
        globalContainer.registerWithMetadata(target);
        if (options?.singleton !== undefined) {
            const descriptor = globalContainer['services'].get(target);
            if (descriptor) {
                descriptor.singleton = options.singleton;
            }
        }
        return target;
    };
}
export function Inject(token) {
    return function (target, propertyKey, parameterIndex) {
        Reflect.defineMetadata('inject', token, target, parameterIndex);
    };
}
// Service tokens for common services
export const SERVICE_TOKENS = {
    Logger: Symbol('Logger'),
    EventBus: Symbol('EventBus'),
    Config: Symbol('Config'),
    Storage: Symbol('Storage'),
    Extractor: Symbol('Extractor'),
    WhatsAppClient: Symbol('WhatsAppClient'),
};
//# sourceMappingURL=DIContainer.js.map