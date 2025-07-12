import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private router: Router) {}

  canActivate(): boolean {
    console.log('%c[AuthGuard] Checking main route access...', 'color: blue; font-weight: bold;');
    return this.checkAuthentication();
  }

  canActivateChild(): boolean {
    console.log('%c[AuthGuard] Checking child route access...', 'color: green; font-weight: bold;');
    return this.checkAuthentication();
  }

  private checkAuthentication(): boolean {
    const token = localStorage.getItem('token');
    console.log('%c[AuthGuard] Retrieved Token:', 'color: orange;', token);

    if (!token) {
      console.warn('%c[AuthGuard] No token found. Redirecting to login...', 'color: red;');
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);

      console.log('%c[AuthGuard] Token found. Checking expiration...', 'color: orange;');
      console.log('%c[AuthGuard] Token expires at:', 'color: cyan;', decodedToken.exp);
      console.log('%c[AuthGuard] Current time:', 'color: cyan;', currentTime);

      if (decodedToken.exp < currentTime) {
        console.warn('%c[AuthGuard] Token expired. Redirecting to login...', 'color: red;');
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
        return false;
      }

      console.log('%c[AuthGuard] Token is valid. Access granted.', 'color: green; font-weight: bold;');
      return true;
    } catch (error) {
      console.error('%c[AuthGuard] Invalid token format. Redirecting to login...', 'color: red;');
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
