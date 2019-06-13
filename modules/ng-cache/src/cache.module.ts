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

@NgModule({
    providers: [
        CacheService
    ]
})
export class CacheModule {
    static forRoot(options: CacheOptions): ModuleWithProviders {
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
