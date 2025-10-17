import { createLogger, format, transports } from 'winston'

const isDev = process.env.NODE_ENV !== 'production'

// In-memory log store shared with /api/logs
export const logs: any[] = []
const MAX_LOGS = 1000

const storeLog = (level: string, message: string, meta?: any) => {
  logs.push({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  })
  if (logs.length > MAX_LOGS) {
    logs.shift()
  }
}

export const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          return `${timestamp} [${level}]: ${message} ${metaStr}`
        })
      )
    })
  ]
})

// Helper functions
export const logAuth = (action: string, data?: any) => {
  logger.info(`[AUTH] ${action}`, data)
  storeLog('info', `[AUTH] ${action}`, data)
}

export const logError = (location: string, error: any, context?: any) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    ...context
  }
  logger.error(`[ERROR] ${location}`, errorData)
  storeLog('error', `[ERROR] ${location}`, errorData)
}

export const logApi = (endpoint: string, data?: any) => {
  logger.info(`[API] ${endpoint}`, data)
  storeLog('info', `[API] ${endpoint}`, data)
}
