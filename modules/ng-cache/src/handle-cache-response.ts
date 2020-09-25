/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

// tslint:disable: no-any

import { HttpResponse } from '@angular/common/http';

import { CacheEntryOptions } from './cache-entry-options';

export function handleCacheResponse<T>(
    response: HttpResponse<T>,
    cacheInfoKey: string,
    entryOptions: CacheEntryOptions
): T;

export function handleCacheResponse(
    response: HttpResponse<unknown>,
    cacheInfoKey: string,
    entryOptions: CacheEntryOptions
): unknown {
    if (cacheInfoKey && response.headers.has(cacheInfoKey)) {
        const headerValue = response.headers.get(cacheInfoKey);
        if (headerValue) {
            const cacheInfo = JSON.parse(headerValue) as CacheEntryOptions;
            if (cacheInfo) {
                if (cacheInfo.hash) {
                    entryOptions.hash = cacheInfo.hash;
                }
                if (cacheInfo.absoluteExpiration && typeof cacheInfo.absoluteExpiration === 'number') {
                    entryOptions.absoluteExpiration = cacheInfo.absoluteExpiration;
                }
            }
        }
    }

    return response.body;
}
