import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ShopDetailsService } from '../shared/shop-details.service';
import { CategoryService } from '../shared/category.service';
import { CartService } from '../shared/cart-service.service';
import { ShopDetails } from '../shared/shop-details.model';
import { Category } from '../shared/category.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  loading = true;
  featuredProducts: ShopDetails[] = [];
  carouselProducts: ShopDetails[] = [];
  quantities: Map<number, number> = new Map();
  addedToCartIds: Set<number> = new Set();

  // Categories
  categories: Category[] = [];
  categoriesLoading = true;

  toastMessage = '';
  toastType: 'success' | 'warning' | 'error' = 'success';
  toastVisible = false;

  // Quick View Modal
  quickViewProduct: ShopDetails | null = null;
  quickViewVisible = false;

  private readonly destroy$ = new Subject<void>();
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public service: ShopDetailsService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading = true;
    this.service.refreshList().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.featuredProducts = this.service.list.slice(0, 10);
        this.carouselProducts = this.shuffleArray([...this.service.list]).slice(0, 12);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  loadCategories(): void {
    this.categoriesLoading = true;
    this.categoryService.getCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.categories = data;
        this.categoriesLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.categoriesLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  trackByProductId(index: number, product: ShopDetails): number {
    return product.id;
  }

  trackByCategoryId(index: number, category: Category): number {
    return category.id;
  }

  navigateToCategory(categoryId: number): void {
    this.router.navigate(['/products'], { queryParams: { category: categoryId } });
  }

  getCategoryImageUrl(category: Category): string {
    if (category.imageUrl) {
      const baseUrl = environment.apiBaseUrl.replace('/api', '');
      return `${baseUrl}${category.imageUrl}`;
    }
    return 'https://via.placeholder.com/200x150/6495ED/ffffff?text=' + encodeURIComponent(category.name);
  }

  onCategoryImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/200x150/6495ED/ffffff?text=Category';
  }

  isAddedToCart(productId: number): boolean {
    return this.addedToCartIds.has(productId);
  }

  getImageUrl(product: ShopDetails): string {
    if (product.imageUrl) {
      const baseUrl = environment.apiBaseUrl.replace('/api', '');
      return `${baseUrl}${product.imageUrl}`;
    }
    return 'https://via.placeholder.com/250x220/6495ED/ffffff?text=No+Image';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/250x220/6495ED/ffffff?text=No+Image';
  }

  getQty(product: ShopDetails): number {
    return this.quantities.get(product.id) ?? 1;
  }

  increaseQty(product: ShopDetails): void {
    const current = this.getQty(product);
    if (current < product.stockQuantity) {
      this.quantities.set(product.id, current + 1);
    }
  }

  decreaseQty(product: ShopDetails): void {
    const current = this.getQty(product);
    if (current > 1) {
      this.quantities.set(product.id, current - 1);
    }
  }

  addToCart(product: ShopDetails): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.showToast('Please login first', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    const qty = this.getQty(product);
    this.cartService.addToCart(product.id, qty).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // Trigger animation
        this.addedToCartIds.add(product.id);
        this.cdr.markForCheck();
        setTimeout(() => {
          this.addedToCartIds.delete(product.id);
          this.cdr.markForCheck();
        }, 600);

        // Decrease stock locally for immediate UI feedback
        product.stockQuantity -= qty;

        this.showToast(`${product.name} (x${qty}) added to cart`, 'success');
        this.quantities.delete(product.id);
        this.refreshCartCount();

        // Refresh products from server to get accurate stock
        this.service.invalidateCache();
        this.service.refreshList(true).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.featuredProducts = this.service.list.slice(0, 10);
            this.carouselProducts = this.shuffleArray([...this.service.list]).slice(0, 12);
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
          const isDuplicate = msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists') || msg.toLowerCase().includes('cart');
          this.showToast(msg, isDuplicate ? 'warning' : 'error');
        } else if (err.status === 0) {
          this.showToast('Cannot connect to server', 'error');
        } else {
          this.showToast('Something went wrong', 'error');
        }
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

  // Quick View Modal Methods
  openQuickView(product: ShopDetails): void {
    this.quickViewProduct = product;
    this.quickViewVisible = true;
    document.body.style.overflow = 'hidden';
    this.cdr.markForCheck();
  }

  closeQuickView(): void {
    this.quickViewVisible = false;
    document.body.style.overflow = '';
    this.cdr.markForCheck();
    setTimeout(() => {
      this.quickViewProduct = null;
      this.cdr.markForCheck();
    }, 300);
  }

  onModalBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('quick-view-overlay')) {
      this.closeQuickView();
    }
  }

  private refreshCartCount(): void {
    this.cartService.getCartItems().pipe(takeUntil(this.destroy$)).subscribe({
      next: (items) => {
        const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartService.updateCartCount(totalCount);
      },
      error: () => {
        // Silently fail
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }
}
