/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from '@angular/core';

import { LoggingApi } from './logging-api';

export interface CacheOptions {
    absoluteExpirationRelativeToNow?: number;
    clearPreviousCache?: boolean;
    enableDebug?: boolean;
    logger?: LoggingApi;
}

export const CACHE_OPTIONS = new InjectionToken<CacheOptions>('CacheOptions');
