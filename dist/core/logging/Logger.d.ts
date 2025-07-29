/// <reference types="node" />
import { EventEmitter } from 'events';
export declare enum LogLevel {
    TRACE = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    FATAL = 5
}
export interface LogContext {
    timestamp: Date;
    level: LogLevel;
    message: string;
    data?: any;
    category?: string;
    traceId?: string;
    correlationId?: string;
    metadata?: Record<string, any>;
}
export interface LogTransport {
    name: string;
    log(context: LogContext): void;
}
export declare class LogFormatter {
    static formatConsole(context: LogContext): string;
    static formatJSON(context: LogContext): string;
}
export declare class ConsoleTransport implements LogTransport {
    private minLevel;
    name: string;
    constructor(minLevel?: LogLevel);
    log(context: LogContext): void;
}
export declare class FileTransport implements LogTransport {
    private filepath;
    private minLevel;
    private maxSize;
    name: string;
    private stream;
    constructor(filepath: string, minLevel?: LogLevel, maxSize?: number);
    private ensureDirectory;
    log(context: LogContext): void;
    private rotate;
    close(): void;
}
export declare class Logger extends EventEmitter {
    private static instance;
    private transports;
    private globalContext;
    private currentLevel;
    private constructor();
    static getInstance(): Logger;
    setLevel(level: LogLevel): void;
    addTransport(transport: LogTransport): void;
    removeTransport(name: string): void;
    setGlobalContext(context: Record<string, any>): void;
    child(context: Record<string, any>): ChildLogger;
    trace(message: string, data?: any): void;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: Error | any): void;
    fatal(message: string, error?: Error | any): void;
    time(label: string): void;
    timeEnd(label: string): void;
    private log;
}
export declare class ChildLogger {
    private parent;
    private context;
    constructor(parent: Logger, context: Record<string, any>);
    trace(message: string, data?: any): void;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: Error | any): void;
    fatal(message: string, error?: Error | any): void;
    time(label: string): void;
    timeEnd(label: string): void;
}
export declare const logger: Logger;
//# sourceMappingURL=Logger.d.ts.map