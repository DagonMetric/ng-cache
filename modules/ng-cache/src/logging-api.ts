/**
 * The minimal logging interface.
 */
export interface LoggingApi {
    debug(message: string, optionalParam?: unknown): void;
    error(message: string | Error, optionalParam?: unknown): void;
}
