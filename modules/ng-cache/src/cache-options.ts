/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from '@angular/core';

import { Observable } from 'rxjs';

import { CacheCheckResult } from './cache-check-result';

export interface CacheOptions {
    absoluteExpirationRelativeToNow?: number;
    clearPreviousCache?: boolean;
    enableDebug?: boolean;
    enableRemoteCacheCheck?: boolean;
    enableRemoteCacheCheckInPlatformServer?: boolean;
    remoteCacheCheckInterval?: number;
    remoteCacheCheckerEndpointUrl?: string | (() => string);
    remoteCacheChecker?(key: string, hash: string): Observable<CacheCheckResult>;
}

export const CACHE_OPTIONS = new InjectionToken<CacheOptions>('CacheOptions');
