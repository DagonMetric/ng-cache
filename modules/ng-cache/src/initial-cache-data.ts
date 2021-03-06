/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from '@angular/core';

export interface InitialCacheData {
    [key: string]: unknown;
}

export const INITIAL_CACHE_DATA = new InjectionToken<InitialCacheData>('InitialCacheData');
