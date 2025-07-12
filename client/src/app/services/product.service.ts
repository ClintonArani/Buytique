import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IApiResponse, IRecommendedProductsData } from '../interfaces/mixed';


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3900/products';
  private apiLink = 'http://localhost:3900';
  constructor(private http: HttpClient) {}

  addProduct(productData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, productData);
  }
  getAllProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }
  getProductById(productId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${productId}`);
  }
  updateProduct(productId: string, productData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${productId}`, productData);
  }
  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${productId}`);
  }
  getRecommendedProducts(userId: string, limit: number): Observable<IApiResponse<IRecommendedProductsData>> {
    return this.http.get<IApiResponse<IRecommendedProductsData>>(
      `${this.apiUrl}/orders/user/${userId}/recommended-products?limit=${limit}`
    );
  }
}