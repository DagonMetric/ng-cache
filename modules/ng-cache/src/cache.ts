/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from '@angular/core';

import { CacheItem } from './cache-item';
import { Storage } from './storage';

export interface Cache {
    readonly keys: string[];
    readonly storage: Storage | null | undefined;
    init(data?: { [key: string]: CacheItem }): void;
    getItem(key: string): CacheItem | null | undefined;
    setItem(key: string, value: CacheItem): void;
    removeItem(key: string): void;
    clear(): void;
}

export const CACHE = new InjectionToken<Cache>('Cache');
