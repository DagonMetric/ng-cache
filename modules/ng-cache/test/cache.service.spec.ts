// tslint:disable: no-floating-promises
// tslint:disable: no-console

import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { CACHE } from '../src/cache';
import { CacheService } from '../src/cache.service';
import { INITIAL_CACHE_DATA } from '../src/initial-cache-data';
import { MemoryCache } from '../src/memory-cache';

describe('CacheService', () => {
    let cacheService: CacheService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CacheService,
                {
                    provide: CACHE,
                    useClass: MemoryCache
                },
                {
                    provide: INITIAL_CACHE_DATA,
                    useValue: {
                        key1: 'value1',
                        key2: false,
                        key3: 0,
                        key4: {
                            a: 1,
                            b: 2
                        }
                    }
                }
            ]
        });

        cacheService = TestBed.get<CacheService>(CacheService) as CacheService;
    });

    it("should work with 'getItem'", () => {
        expect(cacheService.getItem<string>('key1')).toBe('value1');
        expect(cacheService.getItem<boolean>('key2')).toEqual(false);
        expect(cacheService.getItem<number>('key3')).toEqual(0);
        expect(cacheService.getItem<{}>('key4')).toEqual({ a: 1, b: 2 });
    });

    it("should work with 'setItem'", () => {
        cacheService.setItem('testKey', 'testValue');
        expect(cacheService.getItem<string>('testKey')).toBe('testValue');
    });

    it("should work with 'removeItem'", () => {
        cacheService.removeItem('key1');
        expect(cacheService.getItem<string>('key1')).toBeFalsy();
    });

    it("should work with 'clear'", () => {
        cacheService.clear();
        expect(cacheService.getItem<string>('key1')).toBeFalsy();
    });

    it("should work with 'getOrSetSync'", () => {
        const result = cacheService.getOrSetSync<string>('testKey', () => {
            return 'testValue';
        });
        expect(result).toBe('testValue');
    });

    it("should work with 'getOrSetPromise'", async () => {
        const result = await cacheService.getOrSetPromise<string>('testKey', async () => {
            return 'testValue';
        });
        expect(result).toBe('testValue');
    });

    it("should work with 'getOrSet'", (done: DoneFn) => {
        cacheService.getOrSet('testKey', () => {
            return of('testValue');
        }).subscribe(result => {
            expect(result).toBe('testValue');
            done();
        });
    });
});
