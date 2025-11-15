// Professional Logger Utility
// Supports multiple log levels and formats

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private serviceName: string;
  private logLevel: LogLevel;

  constructor(serviceName: string = 'app') {
    this.serviceName = serviceName;
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatLog(entry: LogEntry): string {
    const logFormat = process.env.LOG_FORMAT || 'json';

    if (logFormat === 'json') {
      return JSON.stringify({
        service: this.serviceName,
        ...entry,
        ...(entry.error && {
          error: {
            message: entry.error.message,
            stack: entry.error.stack,
            name: entry.error.name
          }
        })
      });
    }

    // Plain text format
    let log = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${this.serviceName}] ${entry.message}`;
    if (entry.context) {
      log += ` ${JSON.stringify(entry.context)}`;
    }
    if (entry.error) {
      log += `\n${entry.error.stack}`;
    }
    return log;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case 'debug':
      case 'info':
        console.log(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'error':
      case 'fatal':
        console.error(formattedLog);
        break;
    }

    // Send to external monitoring if configured
    if (process.env.ENABLE_ERROR_TRACKING === 'true' && (level === 'error' || level === 'fatal')) {
      this.sendToMonitoring(entry);
    }
  }

  private async sendToMonitoring(entry: LogEntry) {
    // Send to Sentry
    if (process.env.SENTRY_DSN) {
      try {
        // Implement Sentry logging here
      } catch (err) {
        console.error('Failed to send log to Sentry:', err);
      }
    }

    // Send to Datadog
    if (process.env.DATADOG_API_KEY) {
      try {
        // Implement Datadog logging here
      } catch (err) {
        console.error('Failed to send log to Datadog:', err);
      }
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log('error', message, context, error);
  }

  fatal(message: string, context?: Record<string, any>, error?: Error) {
    this.log('fatal', message, context, error);
  }
}

// Export singleton instances
export const logger = new Logger('app');
export const dbLogger = new Logger('database');
export const apiLogger = new Logger('api');
export const authLogger = new Logger('auth');

export default Logger;
