/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { ModuleWithProviders, NgModule } from '@angular/core';

import { CACHE_OPTIONS, CacheOptions } from './cache-options';
import { CacheService } from './cache.service';

/**
 * The `NGMODULE` for providing `CacheService`.
 */
@NgModule({
    providers: [CacheService]
})
export class CacheModule {
    static withOptions(options: CacheOptions): ModuleWithProviders<CacheModule> {
        return {
            ngModule: CacheModule,
            providers: [
                {
                    provide: CACHE_OPTIONS,
                    useValue: options
                }
            ]
        };
    }
}
