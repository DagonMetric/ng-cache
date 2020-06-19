import { Component, ViewEncapsulation } from '@angular/core';

import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    isProd?: boolean;

    constructor() {
        this.isProd = environment.production;
    }
}
