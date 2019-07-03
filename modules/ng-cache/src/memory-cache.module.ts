/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { NgModule } from '@angular/core';

import { CACHE } from './cache';
import { MemoryCache } from './memory-cache';

/**
 * The `NGMODULE` for providing `CACHE` with `MemoryCache`.
 */
@NgModule({
    providers: [
        {
            provide: CACHE,
            useClass: MemoryCache
        }
    ]
})
export class MemoryCacheModule { }
