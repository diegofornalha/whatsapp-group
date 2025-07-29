import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
// Níveis de log
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["TRACE"] = 0] = "TRACE";
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 5] = "FATAL";
})(LogLevel || (LogLevel = {}));
// Formatador de logs
export class LogFormatter {
    static formatConsole(context) {
        const levelColors = {
            [LogLevel.TRACE]: '\x1b[37m', // Branco
            [LogLevel.DEBUG]: '\x1b[36m', // Ciano
            [LogLevel.INFO]: '\x1b[32m', // Verde
            [LogLevel.WARN]: '\x1b[33m', // Amarelo
            [LogLevel.ERROR]: '\x1b[31m', // Vermelho
            [LogLevel.FATAL]: '\x1b[35m' // Magenta
        };
        const reset = '\x1b[0m';
        const color = levelColors[context.level];
        const levelName = LogLevel[context.level];
        const timestamp = context.timestamp.toISOString();
        const category = context.category ? `[${context.category}]` : '';
        let message = `${color}[${timestamp}] ${levelName}${reset} ${category} ${context.message}`;
        if (context.data) {
            message += '\n' + JSON.stringify(context.data, null, 2);
        }
        return message;
    }
    static formatJSON(context) {
        return JSON.stringify({
            timestamp: context.timestamp.toISOString(),
            level: LogLevel[context.level],
            message: context.message,
            category: context.category,
            traceId: context.traceId,
            correlationId: context.correlationId,
            data: context.data,
            metadata: context.metadata
        });
    }
}
// Transportador Console
export class ConsoleTransport {
    constructor(minLevel = LogLevel.DEBUG) {
        this.minLevel = minLevel;
        this.name = 'console';
    }
    log(context) {
        if (context.level >= this.minLevel) {
            console.log(LogFormatter.formatConsole(context));
        }
    }
}
// Transportador para arquivo
export class FileTransport {
    constructor(filepath, minLevel = LogLevel.INFO, maxSize = 10 * 1024 * 1024 // 10MB
    ) {
        this.filepath = filepath;
        this.minLevel = minLevel;
        this.maxSize = maxSize;
        this.name = 'file';
        this.ensureDirectory();
        this.stream = fs.createWriteStream(filepath, { flags: 'a' });
    }
    ensureDirectory() {
        const dir = path.dirname(this.filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    log(context) {
        if (context.level >= this.minLevel) {
            this.stream.write(LogFormatter.formatJSON(context) + '\n');
            // Verificar tamanho do arquivo
            const stats = fs.statSync(this.filepath);
            if (stats.size > this.maxSize) {
                this.rotate();
            }
        }
    }
    rotate() {
        this.stream.end();
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const rotatedPath = `${this.filepath}.${timestamp}`;
        fs.renameSync(this.filepath, rotatedPath);
        this.stream = fs.createWriteStream(this.filepath, { flags: 'a' });
    }
    close() {
        this.stream.end();
    }
}
// Logger principal
export class Logger extends EventEmitter {
    constructor() {
        super();
        this.transports = [];
        this.globalContext = {};
        this.currentLevel = LogLevel.DEBUG;
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    // Configurar nível global
    setLevel(level) {
        this.currentLevel = level;
    }
    // Adicionar transportador
    addTransport(transport) {
        this.transports.push(transport);
    }
    // Remover transportador
    removeTransport(name) {
        this.transports = this.transports.filter(t => t.name !== name);
    }
    // Definir contexto global
    setGlobalContext(context) {
        this.globalContext = { ...this.globalContext, ...context };
    }
    // Criar child logger com contexto específico
    child(context) {
        return new ChildLogger(this, context);
    }
    // Métodos de log
    trace(message, data) {
        this.log(LogLevel.TRACE, message, data);
    }
    debug(message, data) {
        this.log(LogLevel.DEBUG, message, data);
    }
    info(message, data) {
        this.log(LogLevel.INFO, message, data);
    }
    warn(message, data) {
        this.log(LogLevel.WARN, message, data);
    }
    error(message, error) {
        const data = error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
        } : error;
        this.log(LogLevel.ERROR, message, data);
    }
    fatal(message, error) {
        const data = error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
        } : error;
        this.log(LogLevel.FATAL, message, data);
    }
    // Log com timing
    time(label) {
        this.globalContext[`timer_${label}`] = Date.now();
    }
    timeEnd(label) {
        const start = this.globalContext[`timer_${label}`];
        if (start) {
            const duration = Date.now() - start;
            delete this.globalContext[`timer_${label}`];
            this.debug(`${label}: ${duration}ms`);
        }
    }
    // Método principal de log
    log(level, message, data) {
        if (level < this.currentLevel)
            return;
        const context = {
            timestamp: new Date(),
            level,
            message,
            data,
            metadata: this.globalContext
        };
        // Emitir evento
        this.emit('log', context);
        // Enviar para transportadores
        for (const transport of this.transports) {
            try {
                transport.log(context);
            }
            catch (error) {
                console.error(`Error in transport ${transport.name}:`, error);
            }
        }
    }
}
// Child Logger com contexto específico
export class ChildLogger {
    constructor(parent, context) {
        this.parent = parent;
        this.context = context;
    }
    trace(message, data) {
        this.parent.trace(message, { ...this.context, ...data });
    }
    debug(message, data) {
        this.parent.debug(message, { ...this.context, ...data });
    }
    info(message, data) {
        this.parent.info(message, { ...this.context, ...data });
    }
    warn(message, data) {
        this.parent.warn(message, { ...this.context, ...data });
    }
    error(message, error) {
        this.parent.error(message, error);
    }
    fatal(message, error) {
        this.parent.fatal(message, error);
    }
    time(label) {
        this.parent.time(label);
    }
    timeEnd(label) {
        this.parent.timeEnd(label);
    }
}
// Exportar instância global
export const logger = Logger.getInstance();
// Configuração padrão
logger.addTransport(new ConsoleTransport(LogLevel.DEBUG));
logger.addTransport(new FileTransport(path.join(process.cwd(), 'logs', 'app.log'), LogLevel.INFO));
//# sourceMappingURL=Logger.js.map