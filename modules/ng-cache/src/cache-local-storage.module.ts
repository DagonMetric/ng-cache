/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { NgModule } from '@angular/core';

import { CacheLocalStorage } from './cache-local-storage';
import { STORAGE } from './storage';

/**
 * The `NGMODULE` for providing `STORAGE` with `CacheLocalStorage`.
 */
@NgModule({
    providers: [
        {
            provide: STORAGE,
            useClass: CacheLocalStorage
        }
    ]
})
export class CacheLocalStorageModule { }
