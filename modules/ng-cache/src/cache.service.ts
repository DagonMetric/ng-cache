/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

// tslint:disable: no-any

// import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Cache, CACHE } from './cache';
import { CacheEntryOptions } from './cache-entry-options';
import { CacheItem } from './cache-item';
import { CACHE_OPTIONS, CacheOptions } from './cache-options';
import { INITIAL_CACHE_DATA, InitialCacheData } from './initial-cache-data';
import { LoggingApi } from './logging-api';
import { ReturnType } from './return-type';
import { VERSION } from './version';

/**
 * The core cache service implementation.
 */
@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private readonly _options: CacheOptions;
    private readonly _logger: LoggingApi;

    constructor(
        @Inject(CACHE) private readonly _cache: Cache,
        @Optional() @Inject(CACHE_OPTIONS) options?: CacheOptions,
        @Optional() @Inject(INITIAL_CACHE_DATA) data?: InitialCacheData) {
        this._options = options || {};
        this._logger = this._options.logger || {
            debug(message: string, optionalParam: any): void {
                // tslint:disable-next-line: no-console
                console.log(message, optionalParam);
            },
            error(message: string | Error, optionalParam: any): void {
                console.error(message, optionalParam);
            }
        };

        if (this._options.clearPreviousCache) {
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
        if (this._options.enableDebug) {
            this._logger.debug(message);
        }
    }

    // private logError(message: Error | string): void {
    //     this._logger.error(message);
    // }

    private getOrSetInternal(key: string,
        factory: (entryOptions: CacheEntryOptions) => Observable<any> | Promise<any> | Object,
        options?: CacheEntryOptions,
        returnType: ReturnType = ReturnType.Observable): Observable<any> | Promise<any> | Object {
        const entryOptions = this.prepareCacheEntryOptions(options);
        const cachedItem = this._cache.getItem(key);

        if (!cachedItem) {
            return this.invokeFactory(key, factory, entryOptions);
        }

        if (!this.isValid(cachedItem)) {
            this.removeItem(key);

            return this.invokeFactory(key, factory, entryOptions);
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

    private invokeFactory(
        key: string,
        factory: (entryOptions: CacheEntryOptions) => Observable<Object> | Promise<Object> | Object,
        options: CacheEntryOptions,
        setLastRemoteCheckTime?: boolean):
        Observable<any> | Promise<any> | Object {
        const retValue = factory(options);

        if (retValue instanceof Observable) {
            return retValue.pipe(map(value => {
                this.setItemInternal(key, value, options, true, setLastRemoteCheckTime);

                return value;
            }));
        } else if (retValue instanceof Promise) {
            return retValue.then(value => {
                this.setItemInternal(key, value, options, true, setLastRemoteCheckTime);

                return value;
            });
        } else {
            this.setItemInternal(key, retValue, options, true, setLastRemoteCheckTime);

            return retValue;
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

        const absoluteExpiration = this._options.absoluteExpirationRelativeToNow
            ? Date.now() + this._options.absoluteExpirationRelativeToNow
            : undefined;

        return {
            absoluteExpiration: absoluteExpiration,
            ...options
        };
    }

    private isValid(cachedItem: CacheItem): boolean {
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
