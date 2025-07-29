import { EventBus } from './EventBus';
import { AppConfig, ConfigValidationResult } from '../types/config';
/**
 * Configuration Service
 * Manages application configuration with validation, hot-reloading, and environment support
 */
export declare class ConfigService {
    private config;
    private configPath;
    private envOverrides;
    private eventBus;
    private watcherEnabled;
    private watcher?;
    private validators;
    constructor(configPath?: string, eventBus?: EventBus);
    /**
     * Get a configuration value
     */
    get<T = any>(path: string, defaultValue?: T): T;
    /**
     * Set a configuration value
     */
    set(path: string, value: any): void;
    /**
     * Get the entire configuration
     */
    getAll(): AppConfig;
    /**
     * Load configuration from file
     */
    loadConfig(): void;
    /**
     * Save configuration to file
     */
    saveConfig(): void;
    /**
     * Reload configuration
     */
    reload(): void;
    /**
     * Enable configuration file watching
     */
    enableWatcher(): void;
    /**
     * Disable configuration file watching
     */
    disableWatcher(): void;
    /**
     * Add a custom validator
     */
    addValidator(validator: (config: AppConfig) => ConfigValidationResult): void;
    /**
     * Validate configuration
     */
    validate(): ConfigValidationResult;
    /**
     * Private helper methods
     */
    private getDefaultConfigPath;
    private getDefaultConfig;
    private mergeConfigs;
    private applyEnvironmentOverrides;
    private parseEnvValue;
    private validateRequired;
    private validateTypes;
    private validateRanges;
    private validateDependencies;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
//# sourceMappingURL=ConfigService.d.ts.map