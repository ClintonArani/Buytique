import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://localhost:3900/orders';

  constructor(private http: HttpClient) {}

  // Cancel an order
  cancelOrder(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel/${orderId}`, {});
  }

  // Update order status
  updateOrderStatus(orderId: string, newStatus: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-status/${orderId}`, { new_status: newStatus });
  }

  // Get all orders
  getAllOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  // Checkout (create an order)
  checkout(userId: string): Observable<any> {
    return this.http.post(`http://localhost:3900/checkout/${userId}`, {});
  }

  getRecentOrders(limit: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/recent?limit=${limit}`).pipe(
      catchError(error => {
        console.error('Error fetching recent orders:', error);
        throw error;
      })
    );
  }

  getTopProducts(limit: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/top-products?limit=${limit}`);
  }

  // New endpoints for user dashboard
  getUserOrders(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  getUserMonthlySpending(userId: string, months: number = 6): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}/monthly-spending?months=${months}`);
  }

  getUserRecentOrders(userId: string, limit: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}/recent-orders?limit=${limit}`);
  }

  getRecommendedProducts(userId: string, limit: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}/recommended-products?limit=${limit}`);
  }

  getUserPurchaseHistory(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}/purchase-history`);
  }
}