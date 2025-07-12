import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private apiUrl = 'http://localhost:3900/categories';

  constructor(private http: HttpClient) {}
  
  addCategory(category: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, category);
  }
  getAllCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }
  getCategoryById(categoryId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${categoryId}`);
  }
  updateCategory(categoryId: string, categoryData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${categoryId}`, categoryData);
  }
  deleteCategory(categoryId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${categoryId}`);
  }
}