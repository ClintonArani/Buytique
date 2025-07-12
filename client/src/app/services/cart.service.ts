import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, shareReplay, debounceTime } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id?: string;
  user_id?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly apiUrl = 'http://localhost:3900/cart-items';
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();
  private cartItemsCache$: Observable<any> | null = null;

  constructor(private http: HttpClient) {
    this.initializeCartSafely();
  }

  // ================ PUBLIC METHODS ================
  public getCurrentUserId(): string {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const userId = decoded.id || decoded.user_id;
      if (!userId) throw new Error('User ID missing in token');
      return userId;
    } catch (error) {
      console.error('Token decode error:', error);
      throw new Error('Invalid token');
    }
  }

  public addToCart(productId: string, quantity: number): Observable<any> {
    const userId = this.getCurrentUserId();
    const payload = {
      user_id: userId,
      product_id: productId,
      quantity: Math.max(1, quantity)
    };

    return this.http.post(`${this.apiUrl}/add`, payload).pipe(
      tap(() => this.invalidateCacheAndRefresh()),
      catchError(this.handleError)
    );
  }

  public removeFromCart(cartItemId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${cartItemId}`).pipe(
      tap(() => this.invalidateCacheAndRefresh()),
      catchError(this.handleError)
    );
  }

  public getCartItems(): Observable<any> {
    if (!this.cartItemsCache$) {
      this.cartItemsCache$ = this.safeFetchCartItems().pipe(
        shareReplay(1)
      );
    }
    return this.cartItemsCache$;
  }

  public clearCart(): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.delete(`${this.apiUrl}/clear/${userId}`).pipe(
      tap(() => {
        this.cartItemsCache$ = null;
        this.updateCartCount(0);
      }),
      catchError(this.handleError)
    );
  }

  // ================ PRIVATE METHODS ================
  private initializeCartSafely(): void {
    try {
      if (localStorage.getItem('token')) {
        this.safeFetchCartItems().subscribe();
      } else {
        this.updateCartCount(0);
      }
    } catch (error) {
      console.warn('Cart initialization warning:', error);
      this.updateCartCount(0);
    }
  }

  private safeFetchCartItems(): Observable<any> {
    try {
      const userId = this.getCurrentUserId();
      return this.http.get(`${this.apiUrl}/items/${userId}`).pipe(
        tap((response: any) => {
          const count = response?.cartItems?.length || 0;
          this.updateCartCount(count);
        }),
        catchError(error => {
          this.updateCartCount(0);
          return this.handleError(error);
        })
      );
    } catch (error) {
      this.updateCartCount(0);
      return of({ cartItems: [] });
    }
  }

  private invalidateCacheAndRefresh(): void {
    this.cartItemsCache$ = null;
    this.safeFetchCartItems().pipe(debounceTime(300)).subscribe();
  }

  private updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    if (error.error?.message) errorMessage = error.error.message;
    else if (error.status === 400) errorMessage = 'Invalid request';
    else if (error.status === 401) errorMessage = 'Please login to continue';
    else if (error.message) errorMessage = error.message;

    return throwError(() => new Error(errorMessage));
  }


}