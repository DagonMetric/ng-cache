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

/**
 * In-memory cache implementation.
 */
@Injectable({
    providedIn: 'root'
})
export class MemoryCache implements Cache {
    private readonly store = new Map<string, CacheItem>();
    private storageKeyLoaded = false;

    get keys(): string[] {
        const keyArray = Array.from(this.store.keys());
        if (!this.storageKeyLoaded && this.storage && this.storage.enabled) {
            const storeKeys = this.storage.keys;
            if (storeKeys) {
                storeKeys.filter((k) => !keyArray.includes(k)).forEach((k) => keyArray.push(k));
            }

            this.storageKeyLoaded = true;
        }

        return keyArray;
    }

    constructor(@Optional() @Inject(STORAGE) readonly storage?: Storage) {}

    init(data?: { [key: string]: CacheItem }): void {
        if (!data) {
            return;
        }

        Object.keys(data).forEach((key: string) => {
            this.setItem(key, data[key]);
        });
    }

    setItem(key: string, value: CacheItem): void {
        this.store.set(key, value);
        if (this.storage && this.storage.enabled) {
            this.storage.setItem(key, value);
        }
    }

    getItem(key: string): CacheItem | null | undefined {
        let data = this.store.get(key);
        if (!data && this.storage && this.storage.enabled) {
            data = this.storage.getItem(key);
        }

        return data;
    }

    removeItem(key: string): void {
        this.store.delete(key);
        if (this.storage && this.storage.enabled) {
            this.storage.removeItem(key);
        }
    }

    clear(): void {
        this.store.clear();
        if (this.storage && this.storage.enabled) {
            this.storage.clear();
        }
    }
}
