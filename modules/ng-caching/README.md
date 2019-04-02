# Caching library for Angular.

## Get Started

## Installation

npm

```shell
npm install @myanmartools/ng-caching
```

or yarn

```shell
yarn add @myanmartools/ng-caching
```

## Module Setup (app.module.ts)

```typescript
import { CacheLocalStorageModule, CacheModule, MemoryCacheModule } from '@dagonmetric/ng-caching';

@NgModule({
    imports: [
        // Other module imports

        // Caching
        CacheModule,
        CacheLocalStorageModule,
        MemoryCacheModule
    ]
})
export class AppModule { }
```

## Usage (app.component.ts)

```typescript
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { CacheEntryOptions, CacheService, handleCacheResponse } from '@dagonmetric/ng-caching';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { BASE_URL } from './tokens';

export enum UserCacheKeys {
    Users = 'users',
    UsersCacheInfo = 'users.cacheinfo',
}

@Injectable()
export class UserService {

    constructor(
        private readonly _cacheService: CacheService,
        private readonly _httpClient: HttpClient,
        @Inject(BASE_URL) private readonly _baseUrl: string) {
    }

    getUsers(): Observable<string[]> {
        return this._cacheService.getOrSet(UserCacheKeys.Users,
            (entryOptions: CacheEntryOptions) => {
                const endpointUrl = `${this._baseUrl}/api/users`;

                return this._httpClient.get(endpointUrl, { observe: 'response' }).pipe(map(
                    (response: HttpResponse<string[]>) => {
                        return handleCacheResponse<string[]>(response, UserCacheKeys.UsersCacheInfo, entryOptions);
                    }));
            });
    }
}

```

## Feedback and Contributing

Check out the [Contributing](https://github.com/DagonMetric/ng-caching/blob/master/CONTRIBUTING.md) page to see the best places to log issues and start discussions.

## License

This repository is licensed with the [MIT](https://github.com/DagonMetric/ng-caching/blob/master/LICENSE) license.