import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../shared/cart-service.service';
import { CartItem } from '../shared/cart-item.model';
import { ShopDetails } from '../shared/shop-details.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  userId!: string;
  loading = false;
  errorMessage = '';
  promoCode = '';
  showPromo = false;

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'error';
  toastVisible = false;

  // Confirmation modal
  showConfirmModal = false;
  confirmMessage = '';

  // Checkout/Confetti
  showConfetti = false;
  showCheckoutSuccess = false;

  private readonly destroy$ = new Subject<void>();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private confirmCallback: (() => void) | null = null;

  constructor(
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userId = user.id;
        this.loadCart();
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.errorMessage = 'Error loading user data. Please login again.';
      }
    } else {
      this.errorMessage = 'User not found. Please login.';
    }
  }

  loadCart(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.cartService.getCartItems().pipe(takeUntil(this.destroy$)).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.loading = false;
        const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartService.updateCartCount(totalCount);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.loading = false;

        if (err.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if backend is running.';
        } else {
          this.errorMessage = 'Failed to load cart. Please try again.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  removeItem(id: number): void {
    this.openConfirm('Are you sure you want to remove this item?', () => {
      this.cartService.removeItem(id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => this.loadCart(),
        error: (err) => {
          console.error('Error removing item:', err);
          this.showToast('Failed to remove item. Please try again.', 'error');
        }
      });
    });
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.cdr.markForCheck();
      this.cartService.updateCartCount(
        this.cartItems.reduce((sum, i) => sum + i.quantity, 0)
      );
      this.cartService.updateQuantity(item.id, item.userId, item.productId, item.quantity)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (err) => {
            console.error('Update quantity error:', err);
            item.quantity++;
            this.cartService.updateCartCount(
              this.cartItems.reduce((sum, i) => sum + i.quantity, 0)
            );
            const body = err.error;
            const msg = typeof body === 'string' ? body
              : body?.Title || body?.title || body?.Message || body?.message || body?.Detail || body?.detail || 'Failed to update quantity';
            this.showToast(msg, 'error');
            this.cdr.markForCheck();
          }
        });
    }
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity < item.product.stockQuantity) {
      item.quantity++;
      this.cdr.markForCheck();
      this.cartService.updateCartCount(
        this.cartItems.reduce((sum, i) => sum + i.quantity, 0)
      );
      this.cartService.updateQuantity(item.id, item.userId, item.productId, item.quantity)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (err) => {
            console.error('Update quantity error:', err);
            item.quantity--;
            this.cartService.updateCartCount(
              this.cartItems.reduce((sum, i) => sum + i.quantity, 0)
            );
            const body = err.error;
            const msg = typeof body === 'string' ? body
              : body?.Title || body?.title || body?.Message || body?.message || body?.Detail || body?.detail || 'Failed to update quantity';
            this.showToast(msg, 'error');
            this.cdr.markForCheck();
          }
        });
    }
  }

  clearCart(): void {
    this.openConfirm('Remove all items from your cart?', () => {
      const ids = this.cartItems.map(item => item.id);
      let removed = 0;
      ids.forEach(id => {
        this.cartService.removeItem(id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            removed++;
            if (removed === ids.length) this.loadCart();
          },
          error: (err) => {
            console.error('Error clearing cart:', err);
            removed++;
            if (removed === ids.length) this.loadCart();
          }
        });
      });
    });
  }

  getTotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );
  }

  trackById(index: number, item: CartItem): number {
    return item.id;
  }

  // Get full image URL from backend
  getImageUrl(product: ShopDetails): string {
    if (product.imageUrl) {
      // Remove '/api' from base URL and append image path
      const baseUrl = environment.apiBaseUrl.replace('/api', '');
      return `${baseUrl}${product.imageUrl}`;
      // Result: https://localhost:7029/images/products/laptop.jpg
    }
    // Fallback placeholder if no image
    return 'https://via.placeholder.com/120x120/667eea/ffffff?text=' + product.name.charAt(0);
  }

  // Handle broken/missing images
  onImageError(event: any): void {
    const altText = event.target.alt || 'N';
    event.target.src = `https://via.placeholder.com/120x120/667eea/ffffff?text=${altText.charAt(0)}`;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.cdr.markForCheck();
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
      this.cdr.markForCheck();
    }, 4000);
  }

  dismissToast(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastVisible = false;
    this.cdr.markForCheck();
  }

  openConfirm(message: string, callback: () => void): void {
    this.confirmMessage = message;
    this.confirmCallback = callback;
    this.showConfirmModal = true;
    this.cdr.markForCheck();
  }

  onConfirmYes(): void {
    this.showConfirmModal = false;
    this.cdr.markForCheck();
    if (this.confirmCallback) {
      this.confirmCallback();
      this.confirmCallback = null;
    }
  }

  onConfirmNo(): void {
    this.showConfirmModal = false;
    this.confirmCallback = null;
    this.cdr.markForCheck();
  }

  checkout(): void {
    // Show confetti and success message
    this.showConfetti = true;
    this.showCheckoutSuccess = true;
    this.cdr.markForCheck();

    // Hide confetti after animation
    setTimeout(() => {
      this.showConfetti = false;
      this.cdr.markForCheck();
    }, 4000);

    // Clear cart after success display
    setTimeout(() => {
      // Clear cart items in backend
      const ids = this.cartItems.map(item => item.id);
      let removed = 0;
      ids.forEach(id => {
        this.cartService.removeItem(id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            removed++;
            if (removed === ids.length) {
              this.cartItems = [];
              this.cartService.updateCartCount(0);
              this.showCheckoutSuccess = false;
              this.cdr.markForCheck();
            }
          },
          error: () => {
            removed++;
            if (removed === ids.length) {
              this.cartItems = [];
              this.cartService.updateCartCount(0);
              this.showCheckoutSuccess = false;
              this.cdr.markForCheck();
            }
          }
        });
      });
    }, 3000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }
}