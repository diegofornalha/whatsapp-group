/**
 * Application bootstrapper - Configures dependency injection and initializes all services
 */
import { DIContainer } from './Container';
import { ServiceRegistry } from '../ServiceRegistry';
/**
 * Bootstrap the application with all dependencies configured
 */
export declare function bootstrapApplication(): Promise<{
    container: DIContainer;
    serviceRegistry: ServiceRegistry;
}>;
//# sourceMappingURL=bootstrap.d.ts.map