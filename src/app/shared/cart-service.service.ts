import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartItem } from './cart-item.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private baseUrl = environment.apiBaseUrl + '/CartItem';

  // BehaviorSubject to track cart item count
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Update cart count
  updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }

  // Get current cart count
  getCartCount(): number {
    return this.cartCountSubject.getValue();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(
      `${this.baseUrl}/GetCartItems`
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/NewCartItem`,
      { productId, quantity }
    );
  }

  updateQuantity(id: number, userId: string, productId: number, quantity: number): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/UpdateCartItem`,
      { id, userId, productId, quantity }
    );
  }

  removeItem(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/DeleteCartItem/${id}`
    );
  }
}