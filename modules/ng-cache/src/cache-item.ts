/**
 * @license
 * Copyright DagonMetric. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found under the LICENSE file in the root directory of this source tree.
 */

export interface CacheItem {
    // tslint:disable-next-line: ban-types
    data: Object;
    hash?: string;
    absoluteExpiration?: number | null;
    lastAccessTime?: number | null;
    lastRemoteCheckTime?: number | null;
}
