import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ShopDetailsService } from '../shared/shop-details.service';
import { CartService } from '../shared/cart-service.service';
import { ShopDetails } from '../shared/shop-details.model';
import { CartItem } from '../shared/cart-item.model';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: ShopDetails | null = null;
  relatedProducts: ShopDetails[] = [];
  loading = true;
  quantity = 1;
  cartItems: CartItem[] = [];

  // Carousel state
  carouselScrollPosition = 0;

  // Image zoom
  imageZoomed = false;

  toastMessage = '';
  toastType: 'success' | 'warning' | 'error' = 'success';
  toastVisible = false;

  private readonly destroy$ = new Subject<void>();
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private shopService: ShopDetailsService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const productId = parseInt(params['id'], 10);
      this.loadProduct(productId);
    });
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  loadProduct(productId: number): void {
    this.loading = true;
    this.quantity = 1;

    this.shopService.refreshList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (products) => {
        this.product = products.find(p => p.id === productId) || null;

        if (this.product) {
          // Get related products (same category, exclude current product)
          this.relatedProducts = products
            .filter(p => p.categoryId === this.product!.categoryId && p.id !== productId);
          this.carouselScrollPosition = 0;
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadCartItems(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.cartItems = [];
      return;
    }
    this.cartService.getCartItems().pipe(takeUntil(this.destroy$)).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cartItems = [];
      }
    });
  }

  getCartQuantity(productId: number): number {
    const cartItem = this.cartItems.find(item => item.productId === productId);
    return cartItem ? cartItem.quantity : 0;
  }

  getAvailableQuantity(product: ShopDetails): number {
    return Math.max(0, product.stockQuantity - this.getCartQuantity(product.id));
  }

  getImageUrl(product: ShopDetails): string {
    if (product.imageUrl) {
      const baseUrl = environment.apiBaseUrl.replace('/api', '');
      return `${baseUrl}${product.imageUrl}`;
    }
    return 'https://via.placeholder.com/500x500/6495ED/ffffff?text=No+Image';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/500x500/6495ED/ffffff?text=No+Image';
  }

  toggleImageZoom(): void {
    this.imageZoomed = !this.imageZoomed;
    this.cdr.markForCheck();
  }

  increaseQty(): void {
    if (this.product && this.quantity < this.getAvailableQuantity(this.product)) {
      this.quantity++;
    }
  }

  decreaseQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;

    const token = localStorage.getItem('token');
    if (!token) {
      this.showToast('Please login first', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.addToCart(this.product.id, this.quantity).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showToast(`${this.product!.name} (x${this.quantity}) added to cart`, 'success');
        this.quantity = 1;
        this.refreshCartCount();
        this.loadCartItems();

        // Refresh products to get accurate stock
        this.shopService.invalidateCache();
        this.shopService.refreshList(true).pipe(takeUntil(this.destroy$)).subscribe({
          next: (products) => {
            this.product = products.find(p => p.id === this.product!.id) || null;
            if (this.product) {
              this.relatedProducts = products
                .filter(p => p.categoryId === this.product!.categoryId && p.id !== this.product!.id);
            }
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        console.error(err);
        if (err.status === 401) {
          this.showToast('Session expired. Please login again.', 'error');
          localStorage.clear();
          this.router.navigate(['/login']);
        } else if (err.status === 400) {
          const raw = err.error;
          const msg = typeof raw === 'string' ? raw
            : raw?.message || raw?.detail || raw?.title || 'This item is already in your cart';
          this.showToast(msg, 'warning');
        } else if (err.status === 0) {
          this.showToast('Cannot connect to server', 'error');
        } else {
          this.showToast('Something went wrong', 'error');
        }
      }
    });
  }

  addRelatedToCart(product: ShopDetails): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.showToast('Please login first', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.addToCart(product.id, 1).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showToast(`${product.name} added to cart`, 'success');
        this.refreshCartCount();
        this.loadCartItems();
        this.shopService.invalidateCache();
        this.shopService.refreshList(true).pipe(takeUntil(this.destroy$)).subscribe();
      },
      error: (err) => {
        if (err.status === 400) {
          const raw = err.error;
          const msg = typeof raw === 'string' ? raw
            : raw?.message || raw?.detail || raw?.title || 'This item is already in your cart';
          this.showToast(msg, 'warning');
        } else {
          this.showToast('Something went wrong', 'error');
        }
      }
    });
  }

  private refreshCartCount(): void {
    this.cartService.getCartItems().pipe(takeUntil(this.destroy$)).subscribe({
      next: (items) => {
        const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartService.updateCartCount(totalCount);
      }
    });
  }

  showToast(message: string, type: 'success' | 'warning' | 'error'): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.cdr.markForCheck();
    this.toastTimeout = setTimeout(() => {
      this.toastVisible = false;
      this.cdr.markForCheck();
    }, 4000);
  }

  dismissToast(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastVisible = false;
    this.cdr.markForCheck();
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  // Carousel navigation
  scrollCarousel(direction: 'left' | 'right'): void {
    const container = document.querySelector('.related-carousel') as HTMLElement;
    if (!container) return;

    const cardWidth = 220; // Approximate card width + gap
    const scrollAmount = cardWidth * 2;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  onCarouselScroll(event: Event): void {
    const container = event.target as HTMLElement;
    this.carouselScrollPosition = container.scrollLeft;
    this.cdr.markForCheck();
  }

  canScrollLeft(): boolean {
    return this.carouselScrollPosition > 0;
  }

  canScrollRight(): boolean {
    const container = document.querySelector('.related-carousel') as HTMLElement;
    if (!container) return false;
    return container.scrollLeft < (container.scrollWidth - container.clientWidth - 10);
  }
}
