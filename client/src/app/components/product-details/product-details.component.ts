import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { HeaderComponent } from "../header/header.component";
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  productId: string | null = null;
  product: any = null;
  quantity: number = 1;
  cartMessage: string = '';
  isLoading: boolean = false;
  isAddingToCart: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.loadProductDetails(this.productId);
    }
  }

  loadProductDetails(productId: string): void {
    this.isLoading = true;
    this.productService.getProductById(productId).subscribe({
      next: (response) => {
        this.product = response.product;
        this.product.image_path = `http://localhost:3900/${this.product.image_path}`;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.isLoading = false;
      }
    });
  }

  addToCart(): void {
    if (!this.product) return;

    // Validate quantity
    if (this.quantity <= 0) {
      this.cartMessage = 'Quantity must be at least 1';
      setTimeout(() => this.cartMessage = '', 3000);
      return;
    }

    if (this.quantity > this.product.stock_quantity) {
      this.cartMessage = `Only ${this.product.stock_quantity} items available!`;
      setTimeout(() => this.cartMessage = '', 3000);
      return;
    }

    this.isAddingToCart = true;
    this.cartMessage = '';

    this.cartService.addToCart(this.product.id, this.quantity).subscribe({
      next: () => {
        this.cartMessage = `${this.quantity} × ${this.product?.name} added to cart successfully!`;
        this.isAddingToCart = false;
        
        // Refresh the product details to show updated stock quantity
        this.loadProductDetails(this.product.id);
        this.quantity = 1; // Reset quantity after adding to cart
        setTimeout(() => this.cartMessage = '', 1500)
        
      },
      error: (error) => {
        this.cartMessage = error.error?.message || 'Failed to add to cart';
        this.isAddingToCart = false;
        setTimeout(() => this.cartMessage = '', 2000);
      }
    });
  }

  incrementQuantity(): void {
    if (this.quantity < this.product?.stock_quantity) {
      this.quantity++;
    } else {
      this.cartMessage = `Maximum available quantity is ${this.product?.stock_quantity}`;
      setTimeout(() => this.cartMessage = '', 3000);
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  // Validate quantity when user types directly
  validateQuantity(): void {
    if (this.quantity < 1) {
      this.quantity = 1;
    }
    if (this.product && this.quantity > this.product.stock_quantity) {
      this.quantity = this.product.stock_quantity;
      this.cartMessage = `Maximum available quantity is ${this.product.stock_quantity}`;
      setTimeout(() => this.cartMessage = '', 3000);
    }
  }
}