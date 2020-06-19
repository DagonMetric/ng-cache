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

        cacheService = TestBed.inject<CacheService>(CacheService);
    });

    it("should work with 'getItem'", () => {
        void expect(cacheService.getItem<string>('key1')).toBe('value1');
        void expect(cacheService.getItem<boolean>('key2')).toEqual(false);
        void expect(cacheService.getItem<number>('key3')).toEqual(0);
        void expect(cacheService.getItem<{ a: number; b: number }>('key4')).toEqual({ a: 1, b: 2 });
    });

    it("should work with 'setItem'", () => {
        cacheService.setItem('testKey', 'testValue');
        void expect(cacheService.getItem<string>('testKey')).toBe('testValue');
    });

    it("should work with 'removeItem'", () => {
        cacheService.removeItem('key1');
        void expect(cacheService.getItem<string>('key1')).toBeFalsy();
    });

    it("should work with 'clear'", () => {
        cacheService.clear();
        void expect(cacheService.getItem<string>('key1')).toBeFalsy();
    });

    it("should work with 'getOrSetSync'", () => {
        const result = cacheService.getOrSetSync<string>('testKey', () => {
            return 'testValue';
        });
        void expect(result).toBe('testValue');
    });

    it("should work with 'getOrSetPromise'", async () => {
        const result = await cacheService.getOrSetPromise<string>('testKey', async () => Promise.resolve('testValue'));
        void expect(result).toBe('testValue');
    });

    it("should work with 'getOrSet'", (done: DoneFn) => {
        cacheService
            .getOrSet('testKey', () => {
                return of('testValue');
            })
            .subscribe((result) => {
                void expect(result).toBe('testValue');
                done();
            });
    });
});
