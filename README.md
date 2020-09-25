# Caching Service for Angular

[![GitHub Actions Status](https://github.com/DagonMetric/ng-cache/workflows/Main%20Workflow/badge.svg)](https://github.com/DagonMetric/ng-cache/actions)
[![Azure Pipelines Status](https://dev.azure.com/DagonMetric/ng-cache/_apis/build/status/DagonMetric.ng-cache?branchName=master)](https://dev.azure.com/DagonMetric/ng-cache/_build/latest?definitionId=13&branchName=master)
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

Latest npm package is [![npm version](https://badge.fury.io/js/%40dagonmetric%2Fng-cache.svg)](https://www.npmjs.com/package/@dagonmetric/ng-cache)

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

Live edit [app.module.ts in stackblitz](https://stackblitz.com/github/dagonmetric/ng-cache/tree/master/samples/demo-app?file=src%2Fapp%2Fapp.module.ts)

### Usage (app.component.ts)

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

// ng-cache
import { CacheService } from '@dagonmetric/ng-cache';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private cacheService: CacheService, private httpClient: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.cacheService.getOrSet('users', () => {
      return this.httpClient.get<User[]>('/api/users');
    });
  }
}
```

Live edit [app.component.ts in stackblitz](https://stackblitz.com/github/dagonmetric/ng-cache/tree/master/samples/demo-app?file=src%2Fapp%2Fapp.component.ts)

## Samples

* Demo app [view source](https://github.com/DagonMetric/ng-cache/tree/master/samples/demo-app) / [live edit in stackblitz](https://stackblitz.com/github/dagonmetric/ng-cache/tree/master/samples/demo-app)

## Build & Test Tools

We use [lib-tools](https://github.com/lib-tools/lib-tools) for bundling, testing and packaging our library projects.

[![Lib Tools](https://repository-images.githubusercontent.com/273890506/28038a00-dcea-11ea-8b4a-7d655158ccf2)](https://github.com/lib-tools/lib-tools)

## Feedback and Contributing

Check out the [Contributing](https://github.com/DagonMetric/ng-cache/blob/master/CONTRIBUTING.md) page.

## License

This repository is licensed with the [MIT](https://github.com/DagonMetric/ng-cache/blob/master/LICENSE) license.
