/**
 * Logger Utility
 * Centralized logging for the application
 * Follows industry best practices for error tracking and debugging
 */

import { isDevelopment, isProduction } from '../../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
  }

  private addLog(level: LogLevel, message: string, data?: any, error?: Error) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      stack: error?.stack,
    };

    this.logs.push(logEntry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // In production, you would send critical errors to a monitoring service
    if (isProduction && level === 'error') {
      // TODO: Send to monitoring service (e.g., Sentry)
      // Sentry.captureException(error || new Error(message));
    }
  }

  debug(message: string, data?: any) {
    if (isDevelopment) {
      console.debug(this.formatMessage('debug', message, data));
      this.addLog('debug', message, data);
    }
  }

  info(message: string, data?: any) {
    console.info(this.formatMessage('info', message, data));
    this.addLog('info', message, data);
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage('warn', message, data));
    this.addLog('warn', message, data);
  }

  error(message: string, error?: Error, data?: any) {
    console.error(this.formatMessage('error', message, data), error);
    this.addLog('error', message, data, error);
  }

  // Get logs for export or debugging
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs as JSON string
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogEntry, LogLevel };
