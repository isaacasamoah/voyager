import { createLogger, format, transports } from 'winston'

const isDev = process.env.NODE_ENV !== 'production'

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
}

export const logError = (location: string, error: any, context?: any) => {
  logger.error(`[ERROR] ${location}`, {
    message: error.message,
    stack: error.stack,
    ...context
  })
}

export const logApi = (endpoint: string, data?: any) => {
  logger.info(`[API] ${endpoint}`, data)
}
