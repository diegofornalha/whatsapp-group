/// <reference types="node" />
import { EventEmitter } from 'events';
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    CRITICAL = 4
}
export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    levelName: string;
    message: string;
    context?: string;
    metadata?: Record<string, any>;
    error?: Error;
    correlationId?: string;
    source?: string;
}
export interface LoggerConfig {
    minLevel: LogLevel;
    enableConsole: boolean;
    enableFile: boolean;
    logDirectory: string;
    maxFileSize: number;
    maxFiles: number;
    format: 'json' | 'text';
    contextFilter?: string[];
}
export declare class Logger extends EventEmitter {
    private config;
    private buffer;
    private flushInterval?;
    private currentLogFile?;
    private logStream?;
    private static instance?;
    constructor(config?: Partial<LoggerConfig>);
    static getInstance(config?: Partial<LoggerConfig>): Logger;
    initialize(): Promise<void>;
    private ensureLogDirectory;
    private startFlushInterval;
    private flush;
    private writeToFile;
    private getCurrentLogFile;
    private checkRotation;
    private rotateLogFiles;
    private formatLogEntry;
    private shouldLog;
    private log;
    private getCallerInfo;
    private logToConsole;
    debug(message: string, context?: string, metadata?: Record<string, any>): void;
    info(message: string, context?: string, metadata?: Record<string, any>): void;
    warn(message: string, context?: string, metadata?: Record<string, any>): void;
    error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void;
    critical(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void;
    createContext(context: string): ContextualLogger;
    getRecentLogs(count?: number, filter?: Partial<LogEntry>): Promise<LogEntry[]>;
    setLevel(level: LogLevel): void;
    dispose(): Promise<void>;
}
export declare class ContextualLogger {
    private logger;
    private context;
    constructor(logger: Logger, context: string);
    debug(message: string, metadata?: Record<string, any>): void;
    info(message: string, metadata?: Record<string, any>): void;
    warn(message: string, metadata?: Record<string, any>): void;
    error(message: string, error?: Error, metadata?: Record<string, any>): void;
    critical(message: string, error?: Error, metadata?: Record<string, any>): void;
}
//# sourceMappingURL=Logger.d.ts.map