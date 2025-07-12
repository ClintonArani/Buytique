import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: any[] = [];
  totalAmount: number = 0;
  isLoading = true;
  removeItem: string = '';
  errorMessage: string = '';
  private subscriptions = new Subscription();
  
  // Confirmation dialog states
  showRemoveConfirmation = false;
  showCheckoutConfirmation = false;
  itemToRemove: string | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
    this.setupCartUpdates();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupCartUpdates(): void {
    this.subscriptions.add(
      this.cartService.cartCount$.subscribe(() => {
        this.loadCartItems();
      })
    );
  }

  loadCartItems(): void {
    this.isLoading = true;
    this.errorMessage = '';
  
    this.subscriptions.add(
      this.cartService.getCartItems().subscribe({
        next: (response) => {
          this.cartItems = response.cartItems || [];
          this.cartItems = this.cartItems.map(item => ({
            ...item,
            image_path: `http://localhost:3900/${item.image_path}`,
            quantity: Math.max(1, Math.min(1000, item.quantity)), // Clamp between 1-10
            category_name: item.category_name || 'Uncategorized' // Ensure category_name exists
          }));
          this.calculateTotal();
          this.isLoading = false;
        },
        error: (err) => this.handleCartError(err)
      })
    );
  }

  openRemoveConfirmation(cartItemId: string): void {
    this.itemToRemove = cartItemId;
    this.showRemoveConfirmation = true;
  }

  closeRemoveConfirmation(): void {
    this.itemToRemove = null;
    this.showRemoveConfirmation = false;
  }

  confirmRemoveItem(): void {
    if (!this.itemToRemove) return;
    
    this.isLoading = true;
    this.showRemoveConfirmation = false;
    
    this.subscriptions.add(
      this.cartService.removeFromCart(this.itemToRemove).subscribe({
        next: () => {
          this.cartItems = this.cartItems.filter(item => item.id !== this.itemToRemove);
          this.calculateTotal();
          this.isLoading = false;
          this.removeItem = 'Item removed from cart successfully'
          setTimeout(() => this.removeItem = '', 3000)
        },
        error: (err) => {
          this.handleCartError(err);
          this.loadCartItems();
        }
      })
    );
  }

  openCheckoutConfirmation(): void {
    if (this.cartItems.length === 0) {
      this.showError('Your cart is empty');
      return;
    }
    this.showCheckoutConfirmation = true;
  }

  closeCheckoutConfirmation(): void {
    this.showCheckoutConfirmation = false;
  }

  confirmCheckout(): void {
    this.showCheckoutConfirmation = false;
    this.isLoading = true;
    const userId = this.cartService.getCurrentUserId();
    
    this.subscriptions.add(
      this.orderService.checkout(userId).subscribe({
        next: () => {
          this.handleSuccessfulCheckout();
          setTimeout(() => window.location.reload(), 1000);
        },
        error: (err) => this.handleCheckoutError(err)
      })
    );
  }

  updateQuantity(item: any, change: number): void {
    const newQuantity = Math.max(1, Math.min(10, item.quantity + change));
    if (newQuantity === item.quantity) return;

    item.quantity = newQuantity;
    this.calculateTotal();

    this.subscriptions.add(
      this.cartService.addToCart(item.product_id, newQuantity).subscribe({
        error: (err) => {
          item.quantity -= change;
          this.calculateTotal();
          this.errorMessage = 'Failed to update quantity';
          console.error('Quantity update error:', err);
        }
      })
    );
  }

  private handleSuccessfulCheckout(): void {
    this.subscriptions.add(
      this.cartService.clearCart().subscribe({
        next: () => {
          this.cartItems = [];
          this.totalAmount = 0;
          this.isLoading = false;
          alert('Order placed successfully!');
        },
        error: (err) => {
          console.error('Error clearing cart:', err);
          this.isLoading = false;
        }
      })
    );
  }

  private handleCheckoutError(err: any): void {
    console.error('Checkout error:', err);
    this.showError(err.message || 'Checkout failed');
    this.isLoading = false;
  }

  private handleCartError(err: any): void {
    console.error('Cart error:', err);
    this.showError(err.message || 'Failed to load cart items');
    this.isLoading = false;

    if (err.message.includes('authenticated') || err.message.includes('token')) {
      this.cartItems = [];
      this.totalAmount = 0;
    }
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 3000);
  }

  private calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
  }
}