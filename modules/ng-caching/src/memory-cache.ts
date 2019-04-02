/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { Inject, Injectable, Optional } from '@angular/core';

import { Cache } from './cache';
import { CacheItem } from './cache-item';
import { STORAGE, Storage } from './storage';

@Injectable({
    providedIn: 'root'
})
export class MemoryCache implements Cache {
    private readonly _store = new Map<string, CacheItem>();
    private _storageKeyLoaded = false;

    get storage(): Storage | null | undefined {
        return this._storage;
    }

    get keys(): string[] {
        const keyArray = Array.from(this._store.keys());
        if (!this._storageKeyLoaded && this.storage && this.storage.enabled) {
            const storeKeys = this.storage.keys;
            if (storeKeys) {
                storeKeys
                    .filter(k => !keyArray.includes(k))
                    .forEach(k => keyArray.push(k));
            }

            this._storageKeyLoaded = true;
        }

        return keyArray;
    }

    constructor(@Optional() @Inject(STORAGE) private readonly _storage?: Storage) {
    }

    init(data?: { [key: string]: CacheItem }): void {
        if (!data) {
            return;
        }

        Object.keys(data)
            .forEach((key: string) => {
                this.setItem(key, data[key]);
            });
    }

    setItem(key: string, value: CacheItem): void {
        this._store.set(key, value);
        if (this.storage && this.storage.enabled) {
            this.storage.setItem(key, value);
        }
    }

    getItem(key: string): CacheItem | null | undefined {
        let data = this._store.get(key);
        if (!data && this.storage && this.storage.enabled) {
            data = this.storage.getItem(key);
        }

        return data;
    }

    removeItem(key: string): void {
        this._store.delete(key);
        if (this.storage && this.storage.enabled) {
            this.storage.removeItem(key);
        }
    }

    clear(): void {
        this._store.clear();
        if (this.storage && this.storage.enabled) {
            this.storage.clear();
        }
    }
}
