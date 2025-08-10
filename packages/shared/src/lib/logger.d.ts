type LogFunction = (...args: any[]) => void;
interface Logger {
    info: LogFunction;
    warn: LogFunction;
    error: LogFunction;
    debug: LogFunction;
}
export declare const log: Logger;
export default log;
//# sourceMappingURL=logger.d.ts.map