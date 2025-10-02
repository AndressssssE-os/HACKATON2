import fs from 'fs';
import path from 'path';

// Tipos de log
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// Interfaz para logs
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  ip?: string;
}

class Logger {
  private logFile: string;
  private maxFileSize: number;
  private currentDate: string;

  constructor() {
    this.logFile = path.join(__dirname, '../../logs/app.log');
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.currentDate = new Date().toISOString().split('T')[0];
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private shouldRotate(): boolean {
    try {
      const stats = fs.statSync(this.logFile);
      return stats.size > this.maxFileSize;
    } catch {
      return false;
    }
  }

  private rotateLog(): void {
    if (this.shouldRotate()) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = path.join(
        path.dirname(this.logFile),
        `app-${timestamp}.log`
      );
      fs.renameSync(this.logFile, rotatedFile);
    }
  }

  private writeToFile(entry: LogEntry): void {
    try {
      this.rotateLog();
      
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(this.logFile, logLine, 'utf8');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: any, userId?: string, ip?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId,
      ip
    };
  }

  private log(level: LogLevel, message: string, context?: any, userId?: string, ip?: string): void {
    const entry = this.formatMessage(level, message, context, userId, ip);
    
    // Console output
    const consoleMessage = `[${entry.timestamp}] ${level}: ${message}`;
    if (level === LogLevel.ERROR) {
      console.error(consoleMessage, context || '');
    } else if (level === LogLevel.WARN) {
      console.warn(consoleMessage, context || '');
    } else {
      console.log(consoleMessage, context || '');
    }

    // File output
    this.writeToFile(entry);
  }

  // Métodos públicos
  public error(message: string, context?: any, userId?: string, ip?: string): void {
    this.log(LogLevel.ERROR, message, context, userId, ip);
  }

  public warn(message: string, context?: any, userId?: string, ip?: string): void {
    this.log(LogLevel.WARN, message, context, userId, ip);
  }

  public info(message: string, context?: any, userId?: string, ip?: string): void {
    this.log(LogLevel.INFO, message, context, userId, ip);
  }

  public debug(message: string, context?: any, userId?: string, ip?: string): void {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, context, userId, ip);
    }
  }

  // Método para logging de requests HTTP
  public httpRequest(method: string, url: string, statusCode: number, responseTime: number, userId?: string, ip?: string): void {
    this.info(
      `${method} ${url} - ${statusCode} - ${responseTime}ms`,
      { method, url, statusCode, responseTime },
      userId,
      ip
    );
  }

  // Método para logging de errores de base de datos
  public databaseError(operation: string, error: any, userId?: string, ip?: string): void {
    this.error(
      `Database error in ${operation}`,
      { 
        operation, 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      userId,
      ip
    );
  }

  // Método para logging de autenticación
  public authEvent(event: string, userId?: string, email?: string, ip?: string): void {
    this.info(
      `Authentication event: ${event}`,
      { event, email },
      userId,
      ip
    );
  }

  // Método para obtener logs recientes (útil para debugging)
  public getRecentLogs(limit: number = 100): LogEntry[] {
    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }

      const logData = fs.readFileSync(this.logFile, 'utf8');
      const lines = logData.trim().split('\n');
      const logs = lines
        .slice(-limit)
        .map(line => {
          try {
            return JSON.parse(line) as LogEntry;
          } catch {
            return null;
          }
        })
        .filter((log): log is LogEntry => log !== null);

      return logs.reverse(); // Más recientes primero
    } catch (error) {
      this.error('Error reading log file', { error: error.message });
      return [];
    }
  }
}

// Instancia singleton del logger
export const logger = new Logger();

// Middleware de logging para Express
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.userId;
    const ip = req.ip || req.connection.remoteAddress;
    
    logger.httpRequest(
      req.method,
      req.originalUrl,
      res.statusCode,
      duration,
      userId,
      ip
    );
  });
  
  next();
};