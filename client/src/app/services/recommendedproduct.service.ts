import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRecommendedProductsData } from '../interfaces/mixed';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class RecommendedProductsService {
  private apiUrl = 'http://localhost:3900/orders/user';

  constructor(private http: HttpClient) {}

  private getUserIdFromToken(): string | null {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const decoded: any = jwtDecode(token);
      return decoded.id || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getRecommendedProducts(limit: number = 4): Observable<IRecommendedProductsData> {
    const userId = this.getUserIdFromToken();
    
    if (!userId) {
      throw new Error('User ID not found in token');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Cache-Control': 'no-cache', // Add cache control
      'Pragma': 'no-cache' // Ensure no caching
    });

    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const url = `${this.apiUrl}/${userId}/recommended-products?limit=${limit}&t=${timestamp}`;

    console.log('Making request to:', url); // Debug the exact URL being called

    return this.http.get<IRecommendedProductsData>(url, { headers });
  }
}