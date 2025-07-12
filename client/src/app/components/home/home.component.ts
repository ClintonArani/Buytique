import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoriesService } from '../../services/categories.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import { FilterService } from '../../services/filter.service';
import { Subscription, combineLatest } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Category, DecodedToken, IApiResponse, IRecommendedProductsData, IProduct } from '../../interfaces/mixed';
import { ChatbotComponent } from "../chatbot/chatbot.component";
import { RecommendedProductsService } from '../../services/recommendedproduct.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, ChatbotComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  categories: Category[] = []; 
  allProducts: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  recommendedProducts: IProduct[] = [];
  filteredRecommendedProducts: IProduct[] = [];
  userFullName: string = 'Guest';
  isLoadingRecommended: boolean = false;
  isLoadingProducts: boolean = false;
  recommendedError: string | null = null;
  productsError: string | null = null;
  showRecommendedSection: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 20; 
  totalPages: number = 1;
  showChat = false;

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private productService: ProductService,
    private categoriesService: CategoriesService,
    private filterService: FilterService,
    private recommendedProductsService: RecommendedProductsService
  ) {}

  toggleChat() {
    this.showChat = !this.showChat;
  }

  onChatClosed() {
    this.showChat = false;
  }

  ngOnInit(): void {
    this.userFullName = this.getUserFullName();
    this.loadCategoriesAndProducts();
    this.setupFilterListeners();
    this.loadRecommendedProducts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getDecodedToken(): DecodedToken | null {
    try {
      const token = localStorage.getItem('token');
      return token ? jwtDecode<DecodedToken>(token) : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private getUserId(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.userId || null; // Using 'id' instead of 'userId'
  }

  private getUserFullName(): string {
    const decodedToken = this.getDecodedToken();
    if (decodedToken?.firstName && decodedToken?.lastName) {
      return `${decodedToken.firstName} ${decodedToken.lastName}`;
    }
    return 'Guest';
  }

  loadRecommendedProducts(): void {
    this.isLoadingRecommended = true;
    this.recommendedError = null;
    this.showRecommendedSection = true;
  
    this.recommendedProductsService.getRecommendedProducts(4).subscribe({
      next: (response: IRecommendedProductsData) => {
        console.log('Recommended products received:', response.recommendedProducts.length);
        this.recommendedProducts = (response.recommendedProducts || []).map(product => ({
          ...product,
          image_path: this.getFullImagePath(product.image_path),
          category_name: product.category_name || 'Uncategorized'
        }));
        this.isLoadingRecommended = false;
      },
      error: (error) => {
        console.error('Error loading recommended products:', error);
        this.recommendedError = 'Failed to load recommendations. Please try again later.';
        this.isLoadingRecommended = false;
        this.showRecommendedSection = false;
      }
    });
  }

  loadCategoriesAndProducts(): void {
    this.isLoadingProducts = true;
    this.productsError = null;

    this.categoriesService.getAllCategories().subscribe({
      next: (categoriesResponse) => {
        this.categories = categoriesResponse.categories || [];
        
        this.productService.getAllProducts().subscribe({
          next: (productsResponse) => {
            this.allProducts = (productsResponse.products || []).map((product: any) => ({
              ...product,
              image_path: this.getFullImagePath(product.image_path),
              category_name: product.category_name || this.getCategoryName(product.category_id)
            }));
            this.filteredProducts = [...this.allProducts];
            this.updatePagination();
            this.isLoadingProducts = false;
          },
          error: (productsError) => {
            console.error('Error loading products:', productsError);
            this.productsError = 'Failed to load products. Please try again later.';
            this.isLoadingProducts = false;
          }
        });
      },
      error: (categoriesError) => {
        console.error('Error loading categories:', categoriesError);
        this.productsError = 'Failed to load categories. Please try again later.';
        this.isLoadingProducts = false;
      }
    });
  }

  private getFullImagePath(path: string): string {
    if (!path) return 'assets/placeholder-product.png';
    if (path.startsWith('http')) return path;
    return `http://localhost:3900/${path.replace(/^\/+/, '')}`;
  }

  private getCategoryName(categoryId: string): string {
    if (!categoryId) return 'Uncategorized';
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  }

  setupFilterListeners(): void {
    this.subscriptions.add(
      combineLatest([
        this.filterService.searchQuery$,
        this.filterService.categoryFilter$
      ]).subscribe(([searchQuery, categoryId]) => {
        this.applyFilters(searchQuery, categoryId);
      })
    );
  }

  applyFilters(searchQuery: string, categoryId: string): void {
    // Normalize search query to lowercase
    const normalizedSearchQuery = searchQuery ? searchQuery.toLowerCase() : '';

    // Filter main products
    this.filteredProducts = this.allProducts.filter(product => {
      const matchesCategory = categoryId === 'all' || 
                           !categoryId || 
                           product.category_id === categoryId;
      
      const matchesSearch = !normalizedSearchQuery || 
                          product.name.toLowerCase().includes(normalizedSearchQuery) || 
                          (product.category_name && 
                           product.category_name.toLowerCase().includes(normalizedSearchQuery));
      
      return matchesCategory && matchesSearch;
    });

    // Filter recommended products
    this.filteredRecommendedProducts = this.recommendedProducts.filter(product => {
      const matchesCategory = categoryId === 'all' || 
                           !categoryId || 
                           product.category_id === categoryId;
      
      const matchesSearch = !normalizedSearchQuery || 
                          product.name.toLowerCase().includes(normalizedSearchQuery) || 
                          (product.category_name && 
                           product.category_name.toLowerCase().includes(normalizedSearchQuery));
      
      return matchesCategory && matchesSearch;
    });

    // Update recommended section visibility
    this.showRecommendedSection = this.filteredRecommendedProducts.length > 0;

    // Reset pagination
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
  }

  get paginatedProducts(): IProduct[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  trackByProductId(index: number, product: IProduct): string {
    return product.id;
  }

  trackByCategoryId(index: number, category: Category): string {
    return category.id;
  }
}