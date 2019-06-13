/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional, PLATFORM_ID } from '@angular/core';

import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { Cache, CACHE } from './cache';
import { CacheCheckResult } from './cache-check-result';
import { CacheEntryOptions } from './cache-entry-options';
import { CacheItem } from './cache-item';
import { CACHE_OPTIONS, CacheOptions } from './cache-options';
import { INITIAL_CACHE_DATA, InitialCacheData } from './initial-cache-data';
import { ReturnType } from './return-type';
import { VERSION } from './version';

export const REMOTE_CACHE_CHECKER_ENDPOINT_URL = new InjectionToken<string>('RemoteCacheCheckerEndpointUrl');

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private readonly _cacheOptions: CacheOptions;
    private readonly _logger: {
        debug(message: string): void;
        error(message: string | Error): void;
    };
    private readonly _remoteCacheCheckInterval = 1000 * 60 * 60;

    get enableRemoteCacheCheck(): boolean {
        if (!this._cacheOptions.enableRemoteCacheCheck) {
            return false;
        }

        if (isPlatformServer(this._platformId) && !this._cacheOptions.enableRemoteCacheCheckInPlatformServer) {
            return false;
        }

        return true;
    }

    constructor(@Inject(CACHE) private readonly _cache: Cache,
        @Inject(PLATFORM_ID) private readonly _platformId: Object,
        @Optional() private readonly _httpClient?: HttpClient,
        @Optional() @Inject(INITIAL_CACHE_DATA) data?: InitialCacheData,
        @Optional() @Inject(CACHE_OPTIONS) options?: CacheOptions,
        @Optional() @Inject(REMOTE_CACHE_CHECKER_ENDPOINT_URL) remoteCacheCheckerEndpointUrl?: string,
        @Optional() @Inject('LOGGER_FACTORY') loggerFactory?: any) {
        this._cacheOptions = {
            ...options
        };
        if (this._cacheOptions.remoteCacheCheckInterval) {
            this._remoteCacheCheckInterval = this._cacheOptions.remoteCacheCheckInterval;
        }

        if (this.enableRemoteCacheCheck) {
            if (!this._httpClient) {
                throw new Error('HttpClient service is not provided.');
            }

            const httpClient = this._httpClient;
            let checkerEndpointUrl = '';
            if (this._cacheOptions.remoteCacheCheckerEndpointUrl) {
                checkerEndpointUrl = typeof this._cacheOptions.remoteCacheCheckerEndpointUrl === 'string'
                    ? this._cacheOptions.remoteCacheCheckerEndpointUrl
                    : (this._cacheOptions.remoteCacheCheckerEndpointUrl as Function)();
            }

            if (!checkerEndpointUrl && remoteCacheCheckerEndpointUrl) {
                checkerEndpointUrl = remoteCacheCheckerEndpointUrl;
            }

            if (!checkerEndpointUrl) {
                throw new Error('The remoteCacheCheckerEndpointUrl is not provided.');
            }
            this._cacheOptions.remoteCacheChecker = (key: string, hash: string): Observable<CacheCheckResult> => {
                return httpClient.post<CacheCheckResult>(checkerEndpointUrl, { key: key, hash: hash });
            };
        }

        this._logger = loggerFactory
            ? loggerFactory.createLogger('bizappframework.ng-cache.cache-service')
            : {
                debug(message: string): void {
                    // tslint:disable-next-line:no-console
                    console.debug(message);
                },
                error(message: Error | string): void {
                    console.error(message);
                }
            };

        if (this._cacheOptions.clearPreviousCache) {
            this.clear();
        } else {
            this.checkStorage();
        }

        // init cache
        if (data) {
            const mappedData: { [key: string]: CacheItem } = {};
            Object.keys(data)
            .forEach(key => {
                const cacheItem: CacheItem = {
                    data: data[key]
                };
                mappedData[key] = cacheItem;
            });
            this._cache.init(mappedData);
        }
    }

    getItem<T>(key: string): T | null;

    getItem(key: string): any {
        const cachedItem = this._cache.getItem(key);

        if (cachedItem) {
            if (this.isValid(cachedItem)) {
                this.refreshLastAccessTime(key, cachedItem);

                return cachedItem.data;
            } else {
                this.removeItem(key);
            }
        }

        return undefined;
    }

    getOrSetSync<T>(key: string, factory: (entryOptions: CacheEntryOptions) => T, options?: CacheEntryOptions): T;

    getOrSetSync(key: string, factory: (entryOptions: CacheEntryOptions) => any, options?: CacheEntryOptions): any {
        return this.getOrSetInternal(key, factory, options, ReturnType.Sync);
    }

    async getOrSetPromise<T>(key: string,
        factory: (entryOptions: CacheEntryOptions) => Promise<T>,
        options?: CacheEntryOptions): Promise<T>;

    async getOrSetPromise(key: string,
        factory: (entryOptions: CacheEntryOptions) => Promise<any>,
        options?: CacheEntryOptions): Promise<any> {
        return this.getOrSetInternal(key, factory, options, ReturnType.Promise) as Promise<any>;
    }

    getOrSet<T>(key: string,
        factory: (entryOptions: CacheEntryOptions) => Observable<T>,
        options?: CacheEntryOptions): Observable<T>;

    getOrSet(key: string,
        factory: (entryOptions: CacheEntryOptions) => Observable<any>,
        options?: CacheEntryOptions): Observable<any> {
        return this.getOrSetInternal(key, factory, options, ReturnType.Observable) as Observable<any>;
    }

    setItem(key: string, value: Object, options?: CacheEntryOptions): void {
        const entryOptions = this.prepareCacheEntryOptions(options);
        this.setItemInternal(key, value, entryOptions, false, false);
    }

    removeItem(key: string): void {
        this._cache.removeItem(key);
    }

    clear(): void {
        this._cache.clear();
    }

    private checkStorage(): void {
        if (!this._cache.storage ||
            !this._cache.storage.enabled) {
            return;
        }

        const storageLocal = this._cache.storage;

        this.logDebug('Checking storage cache');

        const ngCacheVersion = storageLocal._getNgCacheVersion();
        if (ngCacheVersion !== VERSION.full) {
            this.clear();
            storageLocal._setNgCacheVersion(VERSION.full);
        } else {
            storageLocal.keys.forEach(key => {
                const cacheItem = storageLocal.getItem(key);
                if (!cacheItem || !this.isValid(cacheItem)) {
                    storageLocal.removeItem(key);
                }
            });
        }
    }

    private logDebug(message: string): void {
        if (this._cacheOptions.enableDebug) {
            this._logger.debug(message);
        }
    }

    private logError(message: Error | string): void {
        this._logger.error(message);
    }

    private getOrSetInternal(key: string,
        factory: (entryOptions: CacheEntryOptions) => Observable<any> | Promise<any> | Object,
        options?: CacheEntryOptions,
        returnType: ReturnType = ReturnType.Observable): Observable<any> |
        Promise<any> |
        Object {
        const entryOptions = this.prepareCacheEntryOptions(options);
        const cachedItem = this._cache.getItem(key);

        if (!cachedItem) {
            return this.invokeFactory(key, factory, entryOptions);
        }

        if (!this.isValid(cachedItem)) {
            this.removeItem(key);

            return this.invokeFactory(key, factory, entryOptions);
        }

        const cacheChecker = this._cacheOptions.remoteCacheChecker;

        if (this.enableRemoteCacheCheck &&
            cacheChecker &&
            cachedItem.hash &&
            (!cachedItem.lastRemoteCheckTime ||
                cachedItem.lastRemoteCheckTime <= Date.now() - this._remoteCacheCheckInterval)) {
            if (returnType === ReturnType.Sync) {
                throw new Error("To use remote cache checker, returnType must be 'Observable' or 'Promise'.");
            }

            this.logDebug('Invoking remote cache checker function');
            const ret$ = cacheChecker(key, cachedItem.hash)
                .pipe(catchError(err => {
                    this.logError(err);

                    // tslint:disable-next-line:no-null-keyword
                    return of(null);
                }),
                    switchMap((result: CacheCheckResult) => {
                        // if error
                        if (!result) {
                            this.refreshLastAccessTime(key, cachedItem);

                            return of(cachedItem.data);
                        }

                        if (result.expired) {
                            this.logDebug(`Cache expired, key: ${key}`);
                            this.removeItem(key);

                            if (result.absoluteExpiration) {
                                entryOptions.absoluteExpiration = result.absoluteExpiration;
                            }
                            if (result.hash) {
                                entryOptions.hash = result.hash;
                            }

                            const retValue$ = this.invokeFactory(key, factory, entryOptions, true);
                            if (retValue$ instanceof Observable) {
                                return retValue$;
                            } else if (retValue$ instanceof Promise) {
                                return from(retValue$);
                            } else {
                                return of(retValue$);
                            }
                        } else {
                            this.logDebug(`Cache valid, key: ${key}`);
                            cachedItem.lastRemoteCheckTime = Date.now();
                            if (result.absoluteExpiration) {
                                cachedItem.absoluteExpiration = result.absoluteExpiration;
                            }
                            this.refreshLastAccessTime(key, cachedItem);

                            return of(cachedItem.data);
                        }
                    }));

            if (returnType === ReturnType.Promise) {
                return ret$.toPromise();
            } else {
                return ret$;
            }
        }

        this.refreshLastAccessTime(key, cachedItem);

        if (returnType === ReturnType.Sync) {
            return cachedItem.data;
        } else if (returnType === ReturnType.Promise) {
            return Promise.resolve(cachedItem.data);
        } else {
            return of(cachedItem.data);
        }
    }

    private invokeFactory(key: string,
        factory: (entryOptions: CacheEntryOptions) => Observable<any> | Promise<any> | Object,
        options: CacheEntryOptions,
        setLastRemoteCheckTime?: boolean):
        Observable<any> | Promise<any> | Object {
        const retValue$ = factory(options);

        if (retValue$ instanceof Observable) {
            return retValue$.pipe(map(value => {
                this.setItemInternal(key, value, options, true, setLastRemoteCheckTime);

                return value;
            }));
        } else if (retValue$ instanceof Promise) {
            return retValue$.then(value => {
                this.setItemInternal(key, value, options, true, setLastRemoteCheckTime);

                return value;
            });
        } else {
            this.setItemInternal(key, retValue$, options, true, setLastRemoteCheckTime);

            return retValue$;
        }
    }

    private setItemInternal(key: string,
        value: Object,
        options: CacheEntryOptions,
        setLastAccessTime: boolean,
        setLastRemoteCheckTime?: boolean): void {
        const cacheItem: CacheItem = {
            data: value,
            absoluteExpiration: options.absoluteExpiration,
            hash: options.hash
        };

        const now = Date.now();

        if (setLastAccessTime) {
            cacheItem.lastAccessTime = now;
        }
        if (setLastRemoteCheckTime || (setLastRemoteCheckTime !== false && cacheItem.hash)) {
            cacheItem.lastRemoteCheckTime = now;
        }

        this._cache.setItem(key, cacheItem);
    }

    private refreshLastAccessTime(key: string, cachedItem: CacheItem): void {
        cachedItem.lastAccessTime = Date.now();
        this._cache.setItem(key, cachedItem);
    }

    private prepareCacheEntryOptions(options?: CacheEntryOptions): CacheEntryOptions {
        if (options && typeof options.absoluteExpiration === 'number' && options.absoluteExpiration <= 0) {
            throw new Error('The absolute expiration value must be positive.');
        }

        const absoluteExpiration = this._cacheOptions.absoluteExpirationRelativeToNow
            ? Date.now() + this._cacheOptions.absoluteExpirationRelativeToNow
            : undefined;

        return {
            absoluteExpiration: absoluteExpiration,
            ...options
        };
    }

    private isValid(cachedItem: CacheItem): boolean {
        // tslint:disable-next-line:no-null-keyword
        let valid = cachedItem.data != null;
        if (!valid) {
            return false;
        }

        if (typeof cachedItem.absoluteExpiration === 'number') {
            valid = cachedItem.absoluteExpiration > Date.now();
        }

        return valid;
    }
}
