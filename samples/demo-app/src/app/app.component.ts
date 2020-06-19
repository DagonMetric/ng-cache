import { HttpClient } from '@angular/common/http';
import { Component, ViewEncapsulation } from '@angular/core';

import { Observable } from 'rxjs';

import { CacheService } from '@dagonmetric/ng-cache';

export interface AppOptions {
    name: string;
    lang: string;
    logEnabled: boolean;
    logLevel: number;
    num: number;
    arr: string[];
    child: {
        key1: string;
        key2: boolean;
    };
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    appOptions$: Observable<AppOptions>;

    constructor(private readonly cacheService: CacheService, private readonly httpClient: HttpClient) {
        this.appOptions$ = this.cacheService.getOrSet('configuration', () => {
            return this.httpClient.get<AppOptions>(
                'https://us-central1-ng-config-demo.cloudfunctions.net/configuration'
            );
        });
    }
}
