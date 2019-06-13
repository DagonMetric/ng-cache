/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { NgModule, Optional, SkipSelf } from '@angular/core';

import { CACHE } from './cache';
import { MemoryCache } from './memory-cache';

@NgModule({
    providers: [
        {
            provide: CACHE,
            useClass: MemoryCache
        }
    ]
})
export class MemoryCacheModule {
    constructor(@Optional() @SkipSelf() parentModule: MemoryCacheModule) {
        if (parentModule) {
            throw new Error('MemoryCacheModule has already been loaded, import in root module only.');
        }
    }
}
