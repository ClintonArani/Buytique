import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';
import { CommonModule } from '@angular/common';

interface PurchaseHistoryItem {
  product_id: string;
  product_name: string;
  description: string;
  price: number;
  image_path: string;
  total_quantity_purchased: number;
  times_ordered: number;
  last_purchased_date: string;
  fullImagePath?: string; // Add this new property
}

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-history.component.html',
  styleUrl: './purchase-history.component.css'
})
export class PurchaseHistoryComponent implements OnInit {
  purchaseHistory: PurchaseHistoryItem[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  baseUrl: string = 'http://localhost:3900/';

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPurchaseHistory();
  }

  loadPurchaseHistory(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      this.errorMessage = 'User not logged in';
      this.isLoading = false;
      return;
    }

    this.orderService.getUserPurchaseHistory(user.id)
      .pipe(
        catchError(error => {
          console.error('Error fetching purchase history:', error);
          this.errorMessage = 'Failed to load purchase history';
          this.isLoading = false;
          return of({ success: false, purchaseHistory: [] });
        })
      )
      .subscribe(response => {
        this.isLoading = false;
        if (response.success) {
          this.purchaseHistory = (response.purchaseHistory || []).map((item: { image_path: any; }) => ({
            ...item,
            fullImagePath: item.image_path ? `${this.baseUrl}${item.image_path}` : null
          }));
        } else {
          this.errorMessage = 'No purchase history found';
        }
      });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}