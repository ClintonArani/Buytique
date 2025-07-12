import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  [x: string]: any;
  private apiUrl = 'http://localhost:3900/users'; // Base API URL for better organization

  constructor(private http: HttpClient) {}


  // Register a new user
  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, userData).pipe(
      catchError(this.handleError)
    );
  }

  // Common error handler method
  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error7
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Error Status: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
  // Get all users
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-users`);
  }

  // Get a single user by ID
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }

  // Switch user role
  switchUserRole(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/switch-role`, { user_id: userId });
  }

  // Update a user
  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/update/${userId}`, userData);
  }

  // Delete a user
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${userId}`);
  }

  decodeToken(token: string): any {
    try {
      // Split the token into its parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode the payload part
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Token decoding failed:', error);
      return null;
    }
  }

  // Get current user details from token
  getCurrentUserFromToken(): any {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    return this.decodeToken(token);
  }

  // ... rest of your existing methods ...
}