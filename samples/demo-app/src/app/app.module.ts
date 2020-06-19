import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CacheLocalStorageModule, CacheModule, MemoryCacheModule } from '@dagonmetric/ng-cache';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [CommonModule, BrowserModule, HttpClientModule, CacheModule, CacheLocalStorageModule, MemoryCacheModule],
    bootstrap: [AppComponent]
})
export class AppModule {}
