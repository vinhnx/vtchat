// Re-export the proper Pino logger to maintain import compatibility
export { log, createChildLogger, createTimer, withRequestId, withLogging } from '../../logger-simple';
export { log as default } from '../../logger-simple';
