type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, any>;
  trace_id?: string;
}

class Logger {
  private static instance: Logger;
  private traceId: string;

  private constructor() {
    this.traceId = this.generateTraceId();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  public getTraceId(): string {
    return this.traceId;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      message,
      level,
      timestamp: new Date().toISOString(),
      trace_id: this.traceId,
      context,
    };

    // Em desenvolvimento usamos console colorido, em produção JSON estruturado
    if (process.env.NODE_ENV === 'development') {
      const colors = {
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        debug: '\x1b[34m',
        reset: '\x1b[0m',
      };
      console.log(`${colors[level]}[${level.toUpperCase()}]${colors.reset} ${message}`, context || '');
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  public info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  public warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  public error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }

  public debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }
}

export const logger = Logger.getInstance();
