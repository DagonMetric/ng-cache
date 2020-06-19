/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from '@angular/core';

import { CacheItem } from './cache-item';

export interface Storage {
    readonly name: string;
    readonly enabled: boolean;
    readonly keys: string[];
    setItem(key: string, value: CacheItem): boolean;
    getItem(key: string): CacheItem | undefined;
    removeItem(key: string): void;
    clear(): void;

    _getNgCacheVersion(): string | null | undefined;
    _setNgCacheVersion(ver: string): void;
}

export const STORAGE = new InjectionToken<Storage>('Storage');
