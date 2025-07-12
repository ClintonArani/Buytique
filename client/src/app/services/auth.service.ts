import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode'; 
interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  // Add other properties from your JWT token as needed
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3900/auth/login'; 
  private logoutUrl = 'http://localhost:3900/auth/logout'; 

  constructor(private http: HttpClient, private router: Router, ) {}

  login(credentials: { email: string; password: string }): Observable<{ token: string; role: string; message: string }> {
    return this.http.post<{ token: string; role: string; message: string }>(this.apiUrl, credentials).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token); 
        localStorage.setItem('role', response.role); 
      })
    );
  }


  logout(): Observable<{ message: string }> {
    const token = this.getToken();
    if (!token) {
      this.clearLocalStorageAndNavigate();
      throw new Error('No token found');
    }

    return this.http
      .post<{ message: string }>(
        this.logoutUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .pipe(
        tap({
          next: () => {
            this.clearLocalStorageAndNavigate();
          },
          error: (err) => {
            this.clearLocalStorageAndNavigate();
            console.error('Logout failed:', err);
          },
        })
      );
  }

  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return {
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
        role: decodedToken.role
        // Add other properties from your JWT token
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private clearLocalStorageAndNavigate(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  getRole(): string | null {
    return localStorage.getItem('role');
  }
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserIdFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.id; 
    }
    return null;
  }
}