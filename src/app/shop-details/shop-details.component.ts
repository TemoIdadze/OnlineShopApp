import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ShopDetailsService } from '../shared/shop-details.service';
import { CartService } from '../shared/cart-service.service';
import { CategoryService } from '../shared/category.service';
import { ShopDetails } from '../shared/shop-details.model';
import { CartItem } from '../shared/cart-item.model';
import { Category } from '../shared/category.model';
import { environment } from '../../environments/environment';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-shop-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shop-details.component.html',
  styleUrl: './shop-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopDetailsComponent implements OnInit, OnDestroy {
  loading = true;
  searchQuery = '';
  filteredList: ShopDetails[] = [];
  quantities: Map<number, number> = new Map();
  cartItems: CartItem[] = [];

  // Category filtering
  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  categoriesLoading = true;
  showMobileFilters = false;

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
    private cartService: CartService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.searchQuery = params['search'] || '';
      const categoryParam = params['category'];
      this.selectedCategoryId = categoryParam ? parseInt(categoryParam, 10) : null;

      if (this.service.list.length > 0) {
        this.filterProducts();
      }
    });

    this.loadData();
    this.loadCartItems();
  }

  loadData(): void {
    this.loading = true;
    this.categoriesLoading = true;

    forkJoin({
      products: this.service.refreshList(),
      categories: this.categoryService.getCategories()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ products, categories }) => {
        this.categories = categories;
        this.categoriesLoading = false;
        this.loading = false;
        this.filterProducts();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.loading = false;
        this.categoriesLoading = false;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  loadProducts(): void {
    this.loading = true;
    this.service.refreshList().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loading = false;
        this.filterProducts();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterProducts(): void {
    let result = [...this.service.list];

    // Filter by category
    if (this.selectedCategoryId !== null) {
      result = result.filter(product => product.categoryId === this.selectedCategoryId);
    }

    // Filter by search query
    const query = this.searchQuery ? this.searchQuery.toLowerCase().trim() : '';
    if (query) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    this.filteredList = result;
    this.cdr.markForCheck();
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.showMobileFilters = false;

    // Update URL with category parameter
    const queryParams: any = {};
    if (this.searchQuery) {
      queryParams.search = this.searchQuery;
    }
    if (categoryId !== null) {
      queryParams.category = categoryId;
    }

    this.router.navigate(['/products'], { queryParams });
    this.filterProducts();
  }

  getSelectedCategoryName(): string {
    if (this.selectedCategoryId === null) return 'All Products';
    const category = this.categories.find(c => c.id === this.selectedCategoryId);
    return category ? category.name : 'Unknown';
  }

  getProductCountByCategory(categoryId: number): number {
    let products = this.service.list.filter(p => p.categoryId === categoryId);

    // Apply search filter if active
    const query = this.searchQuery ? this.searchQuery.toLowerCase().trim() : '';
    if (query) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    return products.length;
  }

  getTotalProductCount(): number {
    if (!this.searchQuery) {
      return this.service.list.length;
    }

    const query = this.searchQuery.toLowerCase().trim();
    return this.service.list.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    ).length;
  }

  getCategoryEmoji(categoryName: string): string {
    const name = categoryName.toLowerCase();
    const emojiMap: Record<string, string> = {
      'fruits': '🍎',
      'fruit': '🍎',
      'vegetables': '🥬',
      'vegetable': '🥕',
      'dairy': '🥛',
      'milk': '🥛',
      'meat': '🥩',
      'poultry': '🍗',
      'chicken': '🍗',
      'fish': '🐟',
      'seafood': '🦐',
      'bakery': '🍞',
      'bread': '🥖',
      'beverages': '🥤',
      'drinks': '🍹',
      'snacks': '🍿',
      'chips': '🍟',
      'frozen': '🧊',
      'ice cream': '🍦',
      'organic': '🌿',
      'baby': '🍼',
      'pets': '🐕',
      'pet food': '🦴',
      'cleaning': '🧹',
      'household': '🏠',
      'personal care': '🧴',
      'health': '💊',
      'pharmacy': '💊',
      'cereal': '🥣',
      'breakfast': '🥞',
      'pasta': '🍝',
      'rice': '🍚',
      'grains': '🌾',
      'canned': '🥫',
      'condiments': '🫙',
      'sauces': '🍯',
      'spices': '🌶️',
      'oils': '🫒',
      'nuts': '🥜',
      'coffee': '☕',
      'tea': '🍵',
      'wine': '🍷',
      'beer': '🍺',
      'alcohol': '🥃',
      'candy': '🍬',
      'chocolate': '🍫',
      'desserts': '🍰',
      'eggs': '🥚',
      'cheese': '🧀',
      'deli': '🥪',
      'prepared': '🍱',
      'ready meals': '🍲'
    };

    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (name.includes(key)) {
        return emoji;
      }
    }
    return '📦';
  }

  getCategoryColor(categoryName: string, index: number): string {
    const name = categoryName.toLowerCase();
    const colorMap: Record<string, string> = {
      'fruits': '#ff6b6b',
      'fruit': '#ff6b6b',
      'vegetables': '#51cf66',
      'vegetable': '#51cf66',
      'dairy': '#74c0fc',
      'milk': '#74c0fc',
      'meat': '#e64980',
      'poultry': '#f59f00',
      'fish': '#22b8cf',
      'seafood': '#22b8cf',
      'bakery': '#fab005',
      'bread': '#fab005',
      'beverages': '#845ef7',
      'drinks': '#845ef7',
      'snacks': '#ff922b',
      'frozen': '#4dabf7',
      'organic': '#40c057',
      'cleaning': '#20c997',
      'health': '#f06595'
    };

    for (const [key, color] of Object.entries(colorMap)) {
      if (name.includes(key)) {
        return color;
      }
    }

    // Fallback colors based on index
    const fallbackColors = [
      '#4ecdc4', '#ff6b6b', '#845ef7', '#fab005',
      '#51cf66', '#22b8cf', '#ff922b', '#f06595'
    ];
    return fallbackColors[index % fallbackColors.length];
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }

  trackByProductId(index: number, product: ShopDetails): number {
    return product.id;
  }

  trackByCategoryId(index: number, category: Category): number {
    return category.id;
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
    const available = this.getAvailableQuantity(product);
    if (current < available) {
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
        this.showToast(`${product.name} (x${qty}) added to cart`, 'success');
        this.quantities.delete(product.id);
        this.refreshCartCount();
        this.loadCartItems();

        // Refresh products from server to get accurate stock
        this.service.invalidateCache();
        this.service.refreshList(true).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.filterProducts();
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

  clearSearch(): void {
    this.searchQuery = '';
    const queryParams: any = {};
    if (this.selectedCategoryId !== null) {
      queryParams.category = this.selectedCategoryId;
    }
    this.router.navigate(['/products'], { queryParams });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategoryId = null;
    this.router.navigate(['/products']);
    this.filterProducts();
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

  navigateToProduct(product: ShopDetails): void {
    this.router.navigate(['/product', product.id]);
  }
}
