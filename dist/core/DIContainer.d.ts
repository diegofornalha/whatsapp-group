/**
 * Dependency Injection Container
 * Provides a lightweight, type-safe dependency injection system
 */
export type Constructor<T = {}> = new (...args: any[]) => T;
export type Factory<T> = (container: DIContainer) => T | Promise<T>;
export type Token<T> = symbol | string | Constructor<T>;
export interface ServiceDescriptor<T = any> {
    token: Token<T>;
    useClass?: Constructor<T>;
    useValue?: T;
    useFactory?: Factory<T>;
    useExisting?: Token<T>;
    singleton?: boolean;
    dependencies?: Token<any>[];
    metadata?: Record<string, any>;
}
export interface DIContainerOptions {
    parent?: DIContainer;
    autoRegister?: boolean;
    enableLogging?: boolean;
}
export declare class DIContainer {
    private services;
    private instances;
    private resolving;
    private parent?;
    private options;
    constructor(options?: DIContainerOptions);
    /**
     * Register a service
     */
    register<T>(descriptor: ServiceDescriptor<T>): this;
    /**
     * Register a class
     */
    registerClass<T>(token: Token<T>, constructor: Constructor<T>, options?: {
        singleton?: boolean;
        dependencies?: Token<any>[];
    }): this;
    /**
     * Register a value
     */
    registerValue<T>(token: Token<T>, value: T): this;
    /**
     * Register a factory
     */
    registerFactory<T>(token: Token<T>, factory: Factory<T>, options?: {
        singleton?: boolean;
    }): this;
    /**
     * Register with decorator metadata (for use with decorators)
     */
    registerWithMetadata<T>(constructor: Constructor<T>): this;
    /**
     * Resolve a service
     */
    resolve<T>(token: Token<T>): Promise<T>;
    /**
     * Resolve a service synchronously (throws if async resolution is needed)
     */
    resolveSync<T>(token: Token<T>): T;
    /**
     * Check if a service is registered
     */
    has(token: Token<any>): boolean;
    /**
     * Get all registered services
     */
    getServices(): Token<any>[];
    /**
     * Clear all services and instances
     */
    clear(): void;
    /**
     * Create a child container
     */
    createChild(): DIContainer;
    /**
     * Dispose of all singleton instances
     */
    dispose(): Promise<void>;
    /**
     * Private helper methods
     */
    private createInstance;
    private getDependencies;
    private tokenToString;
}
export declare const globalContainer: DIContainer;
export declare function Injectable(options?: {
    singleton?: boolean;
}): <T extends Constructor<{}>>(target: T) => T;
export declare function Inject(token: Token<any>): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare const SERVICE_TOKENS: {
    readonly Logger: symbol;
    readonly EventBus: symbol;
    readonly Config: symbol;
    readonly Storage: symbol;
    readonly Extractor: symbol;
    readonly WhatsAppClient: symbol;
};
//# sourceMappingURL=DIContainer.d.ts.map