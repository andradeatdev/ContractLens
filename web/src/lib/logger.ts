type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, unknown>;
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
    return crypto.randomUUID();
  }

  public getTraceId(): string {
    return this.traceId;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      message,
      level,
      timestamp: new Date().toISOString(),
      trace_id: this.traceId,
      context,
    };

    // Em desenvolvimento usamos console colorido, em produção JSON estruturado
    if (process.env.NODE_ENV === 'development') {
      let color = '\x1b[0m';
      switch (level) {
        case 'info': color = '\x1b[32m'; break;
        case 'warn': color = '\x1b[33m'; break;
        case 'error': color = '\x1b[31m'; break;
        case 'debug': color = '\x1b[34m'; break;
      }
      const reset = '\x1b[0m';
      console.log(`${color}[${level.toUpperCase()}]${reset} ${message}`, context || '');
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  public info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  public warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  public error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  public debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }
}

export const logger = Logger.getInstance();
