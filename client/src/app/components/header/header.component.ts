import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { ProductService } from '../../services/product.service'; // Changed from CategoriesService
import { Subscription, filter } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { FilterService } from '../../services/filter.service';
import { UserService } from '../../services/user.service';

interface NavItem {
  name: string;
  active: boolean;
  route?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  categories: any[] = [];
  selectedCategory: string = 'all';
  searchQuery: string = '';
  userName!: string
  private subscriptions = new Subscription();
  
 
  constructor(
    private cartService: CartService,
    private productService: ProductService, // Changed from CategoriesService
    private router: Router,
    private filterService: FilterService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadCategoriesFromProducts();
    this.setupCartSubscription();
    this.loadInitialCartData();
    this.loadUserFromToken();    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadUserFromToken(){
    const userData = this.userService.getCurrentUserFromToken();
    if (userData) {
      this.userName = `${userData.firstName} ${userData.lastName}` .trim(); 
    }
  }
  private loadCategoriesFromProducts(): void {
    this.subscriptions.add(
      this.productService.getAllProducts().subscribe({
        next: (response) => {
          // Extract unique categories from products
          const categoryMap = new Map<string, string>();
          
          if (response.products && response.products.length > 0) {
            response.products.forEach((product: { category_id: string; category_name: string; }) => {
              if (product.category_id && product.category_name) {
                categoryMap.set(product.category_id, product.category_name);
              }
            });
          }
          
          // Convert map to array and add 'All Categories' option
          this.categories = [
            { id: 'all', name: 'All' },
            ...Array.from(categoryMap, ([id, name]) => ({ id, name }))
          ];
          
          this.updateNavItemsWithCategories();
        },
        error: (error) => console.error('Error loading products:', error)
      })
    );
  }

  onSearch(): void {
    // Trigger both filters
    this.filterService.setCategoryFilter(this.selectedCategory);
    this.filterService.setSearchQuery(this.searchQuery.trim().toLowerCase());
    
    if (this.router.url !== '/home') {
      this.router.navigate(['/home']);
    }
  }

  onCategoryChange(): void {
    this.filterService.setCategoryFilter(this.selectedCategory);
    if (this.router.url !== '/home') {
      this.router.navigate(['/home']);
    }
  }

  private loadInitialCartData(): void {
    this.subscriptions.add(
      this.cartService.getCartItems().subscribe({
        error: (err) => console.error('Initial cart load failed:', err)
      })
    );
  }

  private setupCartSubscription(): void {
    this.subscriptions.add(
      this.cartService.cartCount$.subscribe({
        next: (count) => this.cartItemCount = count,
        error: (err) => {
          console.error('Cart count error:', err);
          this.cartItemCount = 0;
        }
      })
    );
  }

  private updateNavItemsWithCategories(): void {
    const categoryNavItems = this.categories.slice(1, 5).map(category => ({
      name: category.name,
      active: false,
      route: `/category/${category.id}` // Using id since we don't have slug
    }));
  }
}