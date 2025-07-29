/**
 * Dependency Injection Container
 *
 * Provides a lightweight IoC container for managing dependencies
 * throughout the application lifecycle.
 */
import { ServiceConfig } from '../../types';
/**
 * Token type for dependency injection
 */
export type Token<T = any> = string | Symbol | {
    new (...args: any[]): T;
};
/**
 * Service descriptor for registration
 */
export interface ServiceDescriptor<T = any> {
    token: Token<T>;
    factory: Factory<T>;
    lifecycle: Lifecycle;
    config?: ServiceConfig;
    dependencies?: Token[];
}
/**
 * Factory function type
 */
export type Factory<T> = (container: Container) => T | Promise<T>;
/**
 * Service lifecycle types
 */
export declare enum Lifecycle {
    SINGLETON = "singleton",
    TRANSIENT = "transient",
    SCOPED = "scoped"
}
/**
 * Dependency injection container
 */
export declare class Container {
    private services;
    private singletons;
    private scopedInstances;
    private currentScope;
    private resolving;
    /**
     * Register a service with the container
     */
    register<T>(descriptor: ServiceDescriptor<T>): this;
    /**
     * Register a singleton service
     */
    registerSingleton<T>(token: Token<T>, factory: Factory<T>, config?: ServiceConfig): this;
    /**
     * Register a transient service
     */
    registerTransient<T>(token: Token<T>, factory: Factory<T>, config?: ServiceConfig): this;
    /**
     * Register a scoped service
     */
    registerScoped<T>(token: Token<T>, factory: Factory<T>, config?: ServiceConfig): this;
    /**
     * Register a class with automatic dependency injection
     */
    registerClass<T>(token: Token<T>, constructor: new (...args: any[]) => T, lifecycle?: Lifecycle, config?: ServiceConfig): this;
    /**
     * Resolve a service from the container
     */
    resolve<T>(token: Token<T>): Promise<T>;
    /**
     * Resolve a singleton service
     */
    private resolveSingleton;
    /**
     * Resolve a transient service
     */
    private resolveTransient;
    /**
     * Resolve a scoped service
     */
    private resolveScoped;
    /**
     * Create a new scope
     */
    createScope(): object;
    /**
     * Execute a function within a scope
     */
    runInScope<T>(scope: object, fn: () => T | Promise<T>): Promise<T>;
    /**
     * Check if a service is registered
     */
    has(token: Token): boolean;
    /**
     * Get all registered services
     */
    getServices(): Token[];
    /**
     * Get service descriptor
     */
    getDescriptor(token: Token): ServiceDescriptor | undefined;
    /**
     * Clear all services
     */
    clear(): Promise<void>;
    /**
     * Check if an instance is a service
     */
    private isService;
    /**
     * Get token name for error messages
     */
    private getTokenName;
}
/**
 * Default container instance
 */
export declare const defaultContainer: Container;
/**
 * Decorator to mark a class as injectable
 */
export declare function Injectable(lifecycle?: Lifecycle): (target: any) => any;
/**
 * Decorator to inject a dependency
 */
export declare function Inject(token: Token): (target: any, propertyKey: string | symbol, parameterIndex?: number) => void;
/**
 * Service locator pattern (use sparingly)
 */
export declare class ServiceLocator {
    private static container;
    static setContainer(container: Container): void;
    static get<T>(token: Token<T>): Promise<T>;
    static has(token: Token): boolean;
}
//# sourceMappingURL=Container.d.ts.map