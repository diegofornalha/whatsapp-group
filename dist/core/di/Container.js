/**
 * Dependency Injection Container
 *
 * Provides a lightweight IoC container for managing dependencies
 * throughout the application lifecycle.
 */
/**
 * Service lifecycle types
 */
export var Lifecycle;
(function (Lifecycle) {
    Lifecycle["SINGLETON"] = "singleton";
    Lifecycle["TRANSIENT"] = "transient";
    Lifecycle["SCOPED"] = "scoped";
})(Lifecycle || (Lifecycle = {}));
/**
 * Dependency injection container
 */
export class Container {
    constructor() {
        this.services = new Map();
        this.singletons = new Map();
        this.scopedInstances = new WeakMap();
        this.currentScope = null;
        this.resolving = new Set();
    }
    /**
     * Register a service with the container
     */
    register(descriptor) {
        this.services.set(descriptor.token, descriptor);
        return this;
    }
    /**
     * Register a singleton service
     */
    registerSingleton(token, factory, config) {
        return this.register({
            token,
            factory,
            lifecycle: Lifecycle.SINGLETON,
            config
        });
    }
    /**
     * Register a transient service
     */
    registerTransient(token, factory, config) {
        return this.register({
            token,
            factory,
            lifecycle: Lifecycle.TRANSIENT,
            config
        });
    }
    /**
     * Register a scoped service
     */
    registerScoped(token, factory, config) {
        return this.register({
            token,
            factory,
            lifecycle: Lifecycle.SCOPED,
            config
        });
    }
    /**
     * Register a class with automatic dependency injection
     */
    registerClass(token, constructor, lifecycle = Lifecycle.SINGLETON, config) {
        const paramTypes = Reflect.getMetadata('design:paramtypes', constructor) || [];
        const dependencies = paramTypes.map((type, index) => {
            const token = Reflect.getMetadata('inject', constructor, index);
            return token || type;
        });
        return this.register({
            token,
            factory: (container) => {
                const args = dependencies.map((dep) => container.resolve(dep));
                return new constructor(...args);
            },
            lifecycle,
            config,
            dependencies
        });
    }
    /**
     * Resolve a service from the container
     */
    async resolve(token) {
        // Check for circular dependencies
        if (this.resolving.has(token)) {
            throw new Error(`Circular dependency detected: ${this.getTokenName(token)}`);
        }
        const descriptor = this.services.get(token);
        if (!descriptor) {
            throw new Error(`Service not registered: ${this.getTokenName(token)}`);
        }
        this.resolving.add(token);
        try {
            switch (descriptor.lifecycle) {
                case Lifecycle.SINGLETON:
                    return await this.resolveSingleton(descriptor);
                case Lifecycle.TRANSIENT:
                    return await this.resolveTransient(descriptor);
                case Lifecycle.SCOPED:
                    return await this.resolveScoped(descriptor);
                default:
                    throw new Error(`Unknown lifecycle: ${descriptor.lifecycle}`);
            }
        }
        finally {
            this.resolving.delete(token);
        }
    }
    /**
     * Resolve a singleton service
     */
    async resolveSingleton(descriptor) {
        if (!this.singletons.has(descriptor.token)) {
            const instance = await descriptor.factory(this);
            this.singletons.set(descriptor.token, instance);
            // Initialize if it's a service
            if (this.isService(instance) && descriptor.config?.autoStart) {
                await instance.initialize();
                await instance.start();
            }
        }
        return this.singletons.get(descriptor.token);
    }
    /**
     * Resolve a transient service
     */
    async resolveTransient(descriptor) {
        const instance = await descriptor.factory(this);
        // Initialize if it's a service
        if (this.isService(instance) && descriptor.config?.autoStart) {
            await instance.initialize();
            await instance.start();
        }
        return instance;
    }
    /**
     * Resolve a scoped service
     */
    async resolveScoped(descriptor) {
        if (!this.currentScope) {
            throw new Error('No active scope for scoped service resolution');
        }
        let scopeMap = this.scopedInstances.get(this.currentScope);
        if (!scopeMap) {
            scopeMap = new Map();
            this.scopedInstances.set(this.currentScope, scopeMap);
        }
        if (!scopeMap.has(descriptor.token)) {
            const instance = await descriptor.factory(this);
            scopeMap.set(descriptor.token, instance);
            // Initialize if it's a service
            if (this.isService(instance) && descriptor.config?.autoStart) {
                await instance.initialize();
                await instance.start();
            }
        }
        return scopeMap.get(descriptor.token);
    }
    /**
     * Create a new scope
     */
    createScope() {
        return {};
    }
    /**
     * Execute a function within a scope
     */
    async runInScope(scope, fn) {
        const previousScope = this.currentScope;
        this.currentScope = scope;
        try {
            return await fn();
        }
        finally {
            this.currentScope = previousScope;
        }
    }
    /**
     * Check if a service is registered
     */
    has(token) {
        return this.services.has(token);
    }
    /**
     * Get all registered services
     */
    getServices() {
        return Array.from(this.services.keys());
    }
    /**
     * Get service descriptor
     */
    getDescriptor(token) {
        return this.services.get(token);
    }
    /**
     * Clear all services
     */
    async clear() {
        // Stop and dispose all singleton services
        for (const [token, instance] of this.singletons) {
            if (this.isService(instance)) {
                await instance.stop();
                await instance.dispose();
            }
        }
        this.services.clear();
        this.singletons.clear();
        this.scopedInstances = new WeakMap();
        this.currentScope = null;
        this.resolving.clear();
    }
    /**
     * Check if an instance is a service
     */
    isService(instance) {
        return (instance &&
            typeof instance.initialize === 'function' &&
            typeof instance.start === 'function' &&
            typeof instance.stop === 'function' &&
            typeof instance.dispose === 'function');
    }
    /**
     * Get token name for error messages
     */
    getTokenName(token) {
        if (typeof token === 'string')
            return token;
        if (typeof token === 'symbol')
            return token.toString();
        if (typeof token === 'function')
            return token.name;
        return String(token);
    }
}
/**
 * Default container instance
 */
export const defaultContainer = new Container();
/**
 * Decorator to mark a class as injectable
 */
export function Injectable(lifecycle = Lifecycle.SINGLETON) {
    return function (target) {
        Reflect.defineMetadata('injectable', true, target);
        Reflect.defineMetadata('lifecycle', lifecycle, target);
        return target;
    };
}
/**
 * Decorator to inject a dependency
 */
export function Inject(token) {
    return function (target, propertyKey, parameterIndex) {
        if (parameterIndex !== undefined) {
            // Constructor parameter injection
            Reflect.defineMetadata('inject', token, target, parameterIndex);
        }
        else {
            // Property injection
            const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
            if (!descriptor) {
                Object.defineProperty(target, propertyKey, {
                    get() {
                        return defaultContainer.resolve(token);
                    },
                    enumerable: true,
                    configurable: true
                });
            }
        }
    };
}
/**
 * Service locator pattern (use sparingly)
 */
export class ServiceLocator {
    static setContainer(container) {
        ServiceLocator.container = container;
    }
    static async get(token) {
        return ServiceLocator.container.resolve(token);
    }
    static has(token) {
        return ServiceLocator.container.has(token);
    }
}
ServiceLocator.container = defaultContainer;
//# sourceMappingURL=Container.js.map