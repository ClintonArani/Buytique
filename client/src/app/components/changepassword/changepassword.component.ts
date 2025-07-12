import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetService } from '../../services/reset.service';

@Component({
  selector: 'app-changepassword',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.css'
})
export class ChangepasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  isLoading = false;
  message = '';
  isSuccess = false;

  constructor(
    private fb: FormBuilder,
    private resetService: ResetService,
    private router: Router,
    private route: ActivatedRoute // Add ActivatedRoute
  ) {
    this.changePasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      resetCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]]
    });
  }

  ngOnInit(): void {
    // Get email from query parameters and set it in the form
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.changePasswordForm.patchValue({
          email: params['email']
        });
      }
    });
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid) {
      this.isLoading = true;
      this.message = '';
      
      const { email, resetCode, newPassword } = this.changePasswordForm.value;
      
      this.resetService.resetPassword(email, resetCode, newPassword).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isSuccess = true;
          this.message = response.message || 'Password reset successfully!';
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.isSuccess = false;
          this.message = error.error.message || 'Failed to reset password. Please try again.';
        }
      });
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }
}