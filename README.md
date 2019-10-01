# Caching Service for Angular

[![Build Status](https://dev.azure.com/DagonMetric/ng-cache/_apis/build/status/DagonMetric.ng-cache?branchName=master)](https://dev.azure.com/DagonMetric/ng-cache/_build/latest?definitionId=13&branchName=master)
[![CircleCI](https://circleci.com/gh/DagonMetric/ng-cache/tree/master.svg?style=svg)](https://circleci.com/gh/DagonMetric/ng-cache/tree/master)
[![codecov](https://codecov.io/gh/DagonMetric/ng-cache/branch/master/graph/badge.svg)](https://codecov.io/gh/DagonMetric/ng-cache)
[![npm version](https://img.shields.io/npm/v/@dagonmetric/ng-cache.svg)](https://www.npmjs.com/package/@dagonmetric/ng-cache)
[![Gitter](https://badges.gitter.im/DagonMetric/general.svg)](https://gitter.im/DagonMetric/general?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Caching service for Angular applications.

## Get Started

### Installation

npm

```bash
npm install @dagonmetric/ng-cache
```

or yarn

```bash
yarn add @dagonmetric/ng-cache
```

### Module Setup (app.module.ts)

```typescript
import { CacheLocalStorageModule, CacheModule, MemoryCacheModule } from '@dagonmetric/ng-cache';

@NgModule({
  imports: [
    // Other module imports

    // ng-cache modules
    CacheModule,
    CacheLocalStorageModule,
    MemoryCacheModule
  ]
})
export class AppModule { }
```

### Usage (app.component.ts)

```typescript
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { CacheService } from '@dagonmetric/ng-cache';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UserService {
  constructor(
    private readonly _cacheService: CacheService,
    private readonly _httpClient: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this._cacheService.getOrSet('users', () => {
      return this._httpClient.get<User[]>('/api/users');
    });
  }
}
```

## Feedback and Contributing

Check out the [Contributing](https://github.com/DagonMetric/ng-cache/blob/master/CONTRIBUTING.md) page to see the best places to log issues and start discussions.

## License

This repository is licensed with the [MIT](https://github.com/DagonMetric/ng-cache/blob/master/LICENSE) license.
