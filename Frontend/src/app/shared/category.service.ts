import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from './category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly baseUrl = environment.apiBaseUrl + '/Category';
  private cache$: Observable<Category[]> | null = null;
  private readonly categoriesSubject = new BehaviorSubject<Category[]>([]);

  readonly categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Fetches all categories with caching
   */
  getCategories(forceRefresh = false): Observable<Category[]> {
    if (!this.cache$ || forceRefresh) {
      this.cache$ = this.http.get<Category[]>(`${this.baseUrl}/AllCategories`).pipe(
        tap(categories => this.categoriesSubject.next(categories)),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  /**
   * Get a single category by ID
   */
  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new category
   */
  createCategory(category: Omit<Category, 'id'>): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/NewCategory`, category).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Update an existing category
   */
  updateCategory(category: Category): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/UpdateCategory`, category).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Delete a category
   */
  deleteCategory(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/DeleteCategory/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Invalidate cache to force fresh data on next request
   */
  invalidateCache(): void {
    this.cache$ = null;
  }

  /**
   * Get current categories snapshot
   */
  get categories(): Category[] {
    return this.categoriesSubject.getValue();
  }
}
