import { Component, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { CartService } from '../cart-service.service';
import { ThemeService } from '../theme.service';
import { ShopDetailsService } from '../shop-details.service';
import { CategoryService } from '../category.service';
import { ShopDetails } from '../shop-details.model';
import { Category } from '../category.model';
import { Observable, Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  styles: []
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn$: Observable<boolean>;
  searchQuery: string = '';
  cartItemCount: number = 0;
  mobileMenuOpen: boolean = false;
  userInitial: string = '?';

  // Search autocomplete
  searchSuggestions: ShopDetails[] = [];
  showSuggestions: boolean = false;
  allProducts: ShopDetails[] = [];
  private searchSubject = new Subject<string>();

  // Categories mega menu
  categories: Category[] = [];
  hoveredCategory: Category | null = null;
  categoryProducts: ShopDetails[] = [];
  megaMenuOpen: boolean = false;

  private cartSub: Subscription | null = null;
  private authSub: Subscription | null = null;
  private searchSub: Subscription | null = null;
  private productsSub: Subscription | null = null;
  private categoriesSub: Subscription | null = null;
  private routeSub: Subscription | null = null;

  @Output() searchEvent = new EventEmitter<string>();

  constructor(
    public authService: AuthService,
    public router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    public themeService: ThemeService,
    private shopDetailsService: ShopDetailsService,
    private categoryService: CategoryService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-wrapper') && !target.closest('.mobile-search')) {
      this.showSuggestions = false;
    }
    if (!target.closest('.categories-dropdown') && !target.closest('.categories-trigger')) {
      this.megaMenuOpen = false;
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ngOnInit(): void {
    // Validate auth state on component init (handles expired tokens)
    this.authService.validateAuthState();

    // Subscribe to cart count changes
    this.cartSub = this.cartService.cartCount$.subscribe(count => {
      this.cartItemCount = count;
    });

    // Load cart count and user initial when logged in
    this.authSub = this.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadCartCount();
        this.loadUserInitial();
      } else {
        this.cartItemCount = 0;
        this.userInitial = '?';
      }
    });

    // Load products for search autocomplete
    this.productsSub = this.shopDetailsService.refreshList().subscribe({
      next: (products) => {
        this.allProducts = products;
      }
    });

    // Load categories for mega menu
    this.categoriesSub = this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });

    // Debounce search input for autocomplete
    this.searchSub = this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(query => {
      this.filterSuggestions(query);
    });

    // Sync search bar with URL query params
    this.routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const searchParam = this.route.snapshot.queryParams['search'];
      if (!searchParam) {
        this.searchQuery = '';
        this.searchSuggestions = [];
        this.showSuggestions = false;
      } else if (searchParam !== this.searchQuery) {
        this.searchQuery = searchParam;
      }
    });
  }

  
  ngOnDestroy(): void {
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    if (this.productsSub) {
      this.productsSub.unsubscribe();
    }
    if (this.categoriesSub) {
      this.categoriesSub.unsubscribe();
    }
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadUserInitial(): void {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.userInitial = (user.username || '?').charAt(0).toUpperCase();
      }
    } catch {
      this.userInitial = '?';
    }
  }

  loadCartCount(): void {
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        this.cartService.updateCartCount(totalCount);
      },
      error: () => {
        this.cartService.updateCartCount(0);
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    this.searchEvent.emit(query);
    if (query) {
      this.router.navigate(['/products'], {
        queryParams: { search: query }
      });
    } else {
      // Empty search - navigate to products without query params to show all
      this.router.navigate(['/products']);
    }
  }

  onSearchInput(): void {
    this.searchEvent.emit(this.searchQuery);
    this.searchSubject.next(this.searchQuery);
    this.showSuggestions = true;
  }

  filterSuggestions(query: string): void {
    if (!query || query.trim().length < 2) {
      this.searchSuggestions = [];
      return;
    }

    const lowerQuery = query.toLowerCase().trim();
    this.searchSuggestions = this.allProducts
      .filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 6); // Limit to 6 suggestions
  }

  selectSuggestion(product: ShopDetails): void {
    this.searchQuery = product.name;
    this.showSuggestions = false;
    this.searchSuggestions = [];
    this.router.navigate(['/products'], {
      queryParams: { search: product.name }
    });
  }

  onSearchFocus(): void {
    if (this.searchQuery.trim().length >= 2) {
      this.filterSuggestions(this.searchQuery);
      this.showSuggestions = true;
    }
  }

  clearSearchAndShowAll(): void {
    this.searchQuery = '';
    this.searchEvent.emit('');
    this.router.navigate(['/products']);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSuggestions = [];
    this.showSuggestions = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Mega Menu Methods
  openMegaMenu(): void {
    this.megaMenuOpen = true;
    if (this.categories.length > 0 && !this.hoveredCategory) {
      this.hoverCategory(this.categories[0]);
    }
  }

  closeMegaMenu(): void {
    this.megaMenuOpen = false;
    this.hoveredCategory = null;
    this.categoryProducts = [];
  }

  hoverCategory(category: Category): void {
    this.hoveredCategory = category;
    this.categoryProducts = this.allProducts
      .filter(p => p.categoryId === category.id)
      .slice(0, 6);
  }

  navigateToCategory(categoryId: number): void {
    this.megaMenuOpen = false;
    this.router.navigate(['/products'], { queryParams: { category: categoryId } });
  }

  navigateToProduct(product: ShopDetails): void {
    this.megaMenuOpen = false;
    this.router.navigate(['/product', product.id]);
  }

  getProductImageUrl(product: ShopDetails): string {
    if (product.imageUrl) {
      const baseUrl = environment.apiBaseUrl.replace('/api', '');
      return `${baseUrl}${product.imageUrl}`;
    }
    return 'https://via.placeholder.com/80x80/6495ED/ffffff?text=No+Image';
  }

  getCategoryEmoji(categoryName: string): string {
    const name = categoryName.toLowerCase();
    const emojiMap: Record<string, string> = {
      'fruits': '🍎', 'fruit': '🍎',
      'vegetables': '🥬', 'vegetable': '🥕',
      'dairy': '🥛', 'milk': '🥛',
      'meat': '🥩', 'poultry': '🍗', 'chicken': '🍗',
      'fish': '🐟', 'seafood': '🦐',
      'bakery': '🍞', 'bread': '🥖',
      'beverages': '🥤', 'drinks': '🍹',
      'snacks': '🍿', 'chips': '🍟',
      'frozen': '🧊', 'ice cream': '🍦',
      'organic': '🌿', 'cleaning': '🧹',
      'health': '💊', 'cereal': '🥣',
      'pasta': '🍝', 'rice': '🍚',
      'canned': '🥫', 'spices': '🌶️',
      'coffee': '☕', 'tea': '🍵',
      'candy': '🍬', 'chocolate': '🍫',
      'eggs': '🥚', 'cheese': '🧀'
    };
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (name.includes(key)) return emoji;
    }
    return '📦';
  }
}
