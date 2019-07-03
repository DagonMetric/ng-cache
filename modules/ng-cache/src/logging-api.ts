/**
 * The minimal logging interface.
 */
export interface LoggingApi {
    // tslint:disable-next-line: no-any
    debug(message: string, optionalParam?: any): void;
    // tslint:disable-next-line: no-any
    error(message: string | Error, optionalParam?: any): void;
}
