import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ShopDetails } from './shop-details.model';

@Injectable({
  providedIn: 'root'
})
export class ShopDetailsService {
  private readonly url = environment.apiBaseUrl + '/Product/AllProducts';
  private cache$: Observable<ShopDetails[]> | null = null;
  private readonly listSubject = new BehaviorSubject<ShopDetails[]>([]);

  /** Observable stream of products - use this instead of direct list access */
  readonly list$ = this.listSubject.asObservable();

  /** Current snapshot of products (for sync access) */
  get list(): ShopDetails[] {
    return this.listSubject.getValue();
  }

  constructor(private http: HttpClient) {}

  /**
   * Fetches products with caching. Uses shareReplay to prevent
   * redundant API calls when multiple components subscribe.
   * @param forceRefresh - Set to true to bypass cache
   */
  refreshList(forceRefresh = false): Observable<ShopDetails[]> {
    if (!this.cache$ || forceRefresh) {
      this.cache$ = this.http.get<ShopDetails[]>(this.url).pipe(
        tap(res => this.listSubject.next(res)),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.cache$;
  }

  /** Clears the cache - call after product updates */
  invalidateCache(): void {
    this.cache$ = null;
  }
}