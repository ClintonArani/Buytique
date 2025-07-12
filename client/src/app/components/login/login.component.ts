import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ HeaderComponent, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = ''; // For displaying error messages
  successMessage: string = ''; // For displaying success messages
  isLoading: boolean = false; // Loading state for submit button

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
  
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
  
        // Store token in localStorage
        localStorage.setItem('token', response.token);
  
        // Decode the token to extract user role
        const decodedToken: any = jwtDecode(response.token);
        const role = decodedToken.role; // Ensure your backend includes `role` in JWT payload
  
        console.log('Decoded Role:', role);
  
        // Store role in localStorage
        localStorage.setItem('role', role);
  
        this.successMessage = response.message;
  
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
  
        // Redirect based on user role
        setTimeout(() => {
          if (role === 'user') {
            this.router.navigate(['/home']);
          } else if (role === 'admin') {
            this.router.navigate(['/admin']);
          }
        }, 1000);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Login failed. Please try again.';
  
        // Hide error message after 3 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
  
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
}
