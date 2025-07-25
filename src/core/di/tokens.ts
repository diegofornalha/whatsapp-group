/**
 * Dependency Injection Tokens
 * 
 * Centralized location for all DI tokens used throughout the application.
 * Using symbols ensures uniqueness and prevents token collisions.
 */

// Configuration tokens
export const CONFIG_TOKEN = Symbol('IAppConfig');
export const CONFIG_MANAGER_TOKEN = Symbol('IConfigManager');
export const CONFIG_LOADER_TOKEN = Symbol('IConfigLoader');

// Extractor tokens
export const MESSAGE_EXTRACTOR_TOKEN = Symbol('IMessageExtractor');
export const GROUP_EXTRACTOR_TOKEN = Symbol('IGroupExtractor');
export const MEDIA_EXTRACTOR_TOKEN = Symbol('IMediaExtractor');
export const USER_EXTRACTOR_TOKEN = Symbol('IUserExtractor');
export const EXTRACTOR_FACTORY_TOKEN = Symbol('IExtractorFactory');

// Storage tokens
export const MESSAGE_STORAGE_TOKEN = Symbol('IMessageStorage');
export const GROUP_STORAGE_TOKEN = Symbol('IGroupStorage');
export const USER_STORAGE_TOKEN = Symbol('IUserStorage');
export const MEDIA_STORAGE_TOKEN = Symbol('IMediaStorage');
export const SESSION_STORAGE_TOKEN = Symbol('ISessionStorage');
export const CACHE_TOKEN = Symbol('ICache');
export const STORAGE_FACTORY_TOKEN = Symbol('IStorageFactory');

// Monitor tokens
export const PERFORMANCE_MONITOR_TOKEN = Symbol('IPerformanceMonitor');
export const ERROR_MONITOR_TOKEN = Symbol('IErrorMonitor');
export const ACTIVITY_MONITOR_TOKEN = Symbol('IActivityMonitor');
export const RESOURCE_MONITOR_TOKEN = Symbol('IResourceMonitor');
export const HEALTH_MONITOR_TOKEN = Symbol('IHealthMonitor');
export const ALERT_MANAGER_TOKEN = Symbol('IAlertManager');
export const MONITOR_FACTORY_TOKEN = Symbol('IMonitorFactory');

// Security tokens
export const AUTHENTICATOR_TOKEN = Symbol('IAuthenticator');
export const AUTHORIZER_TOKEN = Symbol('IAuthorizer');
export const RATE_LIMITER_TOKEN = Symbol('IRateLimiter');
export const VALIDATOR_TOKEN = Symbol('IValidator');
export const ENCRYPTION_TOKEN = Symbol('IEncryption');
export const AUDIT_LOGGER_TOKEN = Symbol('IAuditLogger');
export const SECURITY_SCANNER_TOKEN = Symbol('ISecurityScanner');
export const SECURITY_FACTORY_TOKEN = Symbol('ISecurityFactory');

// Session tokens
export const SESSION_MANAGER_TOKEN = Symbol('ISessionManager');
export const SESSION_PERSISTENCE_TOKEN = Symbol('ISessionPersistence');
export const SESSION_RECOVERY_TOKEN = Symbol('ISessionRecovery');

// Core service tokens
export const LOGGER_TOKEN = Symbol('ILogger');
export const EVENT_BUS_TOKEN = Symbol('IEventBus');
export const SCHEDULER_TOKEN = Symbol('IScheduler');
export const WORKER_POOL_TOKEN = Symbol('IWorkerPool');

// UI service tokens
export const UI_SERVICE_TOKEN = Symbol('IUIService');
export const THEME_SERVICE_TOKEN = Symbol('IThemeService');
export const NOTIFICATION_SERVICE_TOKEN = Symbol('INotificationService');

// Browser and WhatsApp tokens
export const BROWSER_SERVICE_TOKEN = Symbol('IBrowserService');
export const WHATSAPP_SERVICE_TOKEN = Symbol('IWhatsAppService');
export const SCRAPER_SERVICE_TOKEN = Symbol('IScraperService');

// Analytics tokens
export const ANALYTICS_SERVICE_TOKEN = Symbol('IAnalyticsService');
export const METRICS_COLLECTOR_TOKEN = Symbol('IMetricsCollector');

// Export service tokens
export const EXPORT_SERVICE_TOKEN = Symbol('IExportService');
export const REPORT_GENERATOR_TOKEN = Symbol('IReportGenerator');

/**
 * Token registry for type-safe token resolution
 */
export interface TokenRegistry {
  // Config
  [CONFIG_TOKEN]: import('../../types').IAppConfig;
  [CONFIG_MANAGER_TOKEN]: import('../../types').IConfigManager;
  
  // Extractors
  [MESSAGE_EXTRACTOR_TOKEN]: import('../../types').IMessageExtractor;
  [GROUP_EXTRACTOR_TOKEN]: import('../../types').IGroupExtractor;
  [MEDIA_EXTRACTOR_TOKEN]: import('../../types').IMediaExtractor;
  [USER_EXTRACTOR_TOKEN]: import('../../types').IUserExtractor;
  [EXTRACTOR_FACTORY_TOKEN]: import('../../types').IExtractorFactory;
  
  // Storage
  [MESSAGE_STORAGE_TOKEN]: import('../../types').IMessageStorage;
  [GROUP_STORAGE_TOKEN]: import('../../types').IGroupStorage;
  [USER_STORAGE_TOKEN]: import('../../types').IUserStorage;
  [MEDIA_STORAGE_TOKEN]: import('../../types').IMediaStorage;
  [SESSION_STORAGE_TOKEN]: import('../../types').ISessionStorage;
  [CACHE_TOKEN]: import('../../types').ICache;
  [STORAGE_FACTORY_TOKEN]: import('../../types').IStorageFactory;
  
  // Monitors
  [PERFORMANCE_MONITOR_TOKEN]: import('../../types').IPerformanceMonitor;
  [ERROR_MONITOR_TOKEN]: import('../../types').IErrorMonitor;
  [ACTIVITY_MONITOR_TOKEN]: import('../../types').IActivityMonitor;
  [RESOURCE_MONITOR_TOKEN]: import('../../types').IResourceMonitor;
  [HEALTH_MONITOR_TOKEN]: import('../../types').IHealthMonitor;
  [ALERT_MANAGER_TOKEN]: import('../../types').IAlertManager;
  [MONITOR_FACTORY_TOKEN]: import('../../types').IMonitorFactory;
  
  // Security
  [AUTHENTICATOR_TOKEN]: import('../../types').IAuthenticator;
  [AUTHORIZER_TOKEN]: import('../../types').IAuthorizer;
  [RATE_LIMITER_TOKEN]: import('../../types').IRateLimiter;
  [VALIDATOR_TOKEN]: import('../../types').IValidator;
  [ENCRYPTION_TOKEN]: import('../../types').IEncryption;
  [AUDIT_LOGGER_TOKEN]: import('../../types').IAuditLogger;
  [SECURITY_SCANNER_TOKEN]: import('../../types').ISecurityScanner;
  [SECURITY_FACTORY_TOKEN]: import('../../types').ISecurityFactory;
  
  // Sessions
  [SESSION_MANAGER_TOKEN]: import('../../types').ISessionManager;
  [SESSION_PERSISTENCE_TOKEN]: import('../../types').ISessionPersistence;
  [SESSION_RECOVERY_TOKEN]: import('../../types').ISessionRecovery;
}

/**
 * Type-safe token type
 */
export type TypedToken<K extends keyof TokenRegistry> = K;

/**
 * Helper to create typed tokens
 */
export function createToken<T>(name: string): Symbol {
  return Symbol(name);
}

/**
 * Token groups for batch registration
 */
export const EXTRACTOR_TOKENS = [
  MESSAGE_EXTRACTOR_TOKEN,
  GROUP_EXTRACTOR_TOKEN,
  MEDIA_EXTRACTOR_TOKEN,
  USER_EXTRACTOR_TOKEN
] as const;

export const STORAGE_TOKENS = [
  MESSAGE_STORAGE_TOKEN,
  GROUP_STORAGE_TOKEN,
  USER_STORAGE_TOKEN,
  MEDIA_STORAGE_TOKEN,
  SESSION_STORAGE_TOKEN,
  CACHE_TOKEN
] as const;

export const MONITOR_TOKENS = [
  PERFORMANCE_MONITOR_TOKEN,
  ERROR_MONITOR_TOKEN,
  ACTIVITY_MONITOR_TOKEN,
  RESOURCE_MONITOR_TOKEN,
  HEALTH_MONITOR_TOKEN,
  ALERT_MANAGER_TOKEN
] as const;

export const SECURITY_TOKENS = [
  AUTHENTICATOR_TOKEN,
  AUTHORIZER_TOKEN,
  RATE_LIMITER_TOKEN,
  VALIDATOR_TOKEN,
  ENCRYPTION_TOKEN,
  AUDIT_LOGGER_TOKEN,
  SECURITY_SCANNER_TOKEN
] as const;