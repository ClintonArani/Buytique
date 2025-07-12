import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from "../header/header.component";
import { RouterLink, Router } from '@angular/router'; // Add Router import
import { ResetService } from '../../services/reset.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HeaderComponent, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  message = '';
  isSuccess = false;

  constructor(
    private fb: FormBuilder,
    private resetService: ResetService,
    private router: Router // Inject Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.message = '';
      const email = this.forgotPasswordForm.value.email;
      
      this.resetService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isSuccess = true;
          this.message = response.message;
          
          // Redirect to change-password after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/change-password'], {
              queryParams: { email: email } // Pass email as query parameter
            });
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.isSuccess = false;
          this.message = error.error.message || 'Failed to send reset code. Please try again.';
          setTimeout(() => this.message = '', 3000)
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}