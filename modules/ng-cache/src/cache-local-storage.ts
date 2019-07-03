/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';

import { CacheItem } from './cache-item';
import { Storage } from './storage';

export const STORAGE_CACHE_KEY_PREFIX = new InjectionToken<string>('StorageCacheKeyPrefix');
export const DEFAULT_STORAGE_CACHE_KEY_PREFIX = '_cache_.';
export const STORED_VERSION_KEY = '_ngcache_version_';

/**
 * The `localStorage` implementation for `Storage`.
 */
@Injectable({
    providedIn: 'root'
})
export class CacheLocalStorage implements Storage {
    private readonly _cacheKeyPrefix: string;
    private _enabled: boolean | null | undefined;

    get enabled(): boolean {
        if (typeof this._enabled === 'boolean') {
            return this._enabled;
        }

        if (!localStorage) {
            this._enabled = false;

            return this._enabled;
        }

        try {
            let testKey = '__test__';
            let i = 1;
            while (!!localStorage.getItem(testKey)) {
                testKey = `${testKey}${i}`;
                i = i + 1;
            }
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            this._enabled = true;

            return this._enabled;

        } catch (e) {
            this._enabled = false;

            return this._enabled;
        }
    }

    get name(): string {
        return 'localStorage';
    }

    get keys(): string[] {
        if (!this.enabled) {
            return [];
        }

        return Object.keys(localStorage)
            .filter(key => !this._cacheKeyPrefix || key.startsWith(this._cacheKeyPrefix))
            .map((key: string) => {
                if (this._cacheKeyPrefix && key.length > this._cacheKeyPrefix.length) {
                    return key.substr(this._cacheKeyPrefix.length);
                } else {
                    return key;
                }
            });
    }

    constructor(@Optional() @Inject(STORAGE_CACHE_KEY_PREFIX) cacheKeyPrefix?: string) {
        this._cacheKeyPrefix = cacheKeyPrefix || DEFAULT_STORAGE_CACHE_KEY_PREFIX;
    }

    setItem(key: string, value: CacheItem): boolean {
        if (!this.enabled) {
            return false;
        }

        try {
            localStorage.setItem(`${this._cacheKeyPrefix}${key}`, JSON.stringify(value));

            return true;
        } catch (e) {
            return false;
        }
    }

    getItem(key: string): CacheItem | undefined {
        if (!this.enabled) {
            return undefined;
        }

        const value = localStorage.getItem(`${this._cacheKeyPrefix}${key}`);

        if (value == null) {
            return undefined;
        }

        const obj = JSON.parse(value);

        if (typeof obj === 'object') {
            return obj as CacheItem;
        }

        return undefined;
    }

    removeItem(key: string): void {
        if (!this.enabled) {
            return;
        }

        localStorage.removeItem(`${this._cacheKeyPrefix}${key}`);
    }

    clear(): void {
        if (!this.enabled) {
            return;
        }

        if (this._cacheKeyPrefix) {
            this.keys.forEach(key => {
                localStorage.removeItem(`${this._cacheKeyPrefix}${key}`);
            });
        } else {
            localStorage.clear();
        }
    }

    _getNgCacheVersion(): string | null | undefined {
        if (!this.enabled) {
            return undefined;
        }

        return localStorage.getItem(STORED_VERSION_KEY);
    }

    _setNgCacheVersion(ver: string): void {
        if (!this.enabled) {
            return;
        }

        localStorage.setItem(STORED_VERSION_KEY, ver);
    }
}
