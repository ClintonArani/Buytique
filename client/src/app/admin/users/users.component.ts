import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  userForm!: FormGroup;
  users: any[] = [];
  isEditMode = false;
  selectedUser: any = null;
  isModalOpen = false;
  successMessage: string | null = null;
  showConfirmation: boolean = false;
  userToDelete: any = null;

    // Pagination properties
    currentPage: number = 1;
    itemsPerPage: number = 5;
    totalPages: number = 1;

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUsers();
  }

  // Initialize the form
  initializeForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', Validators.required], // Include role field
    });
  }

  // Load all users
  loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      (response) => {
        this.users = response.users; // Assuming the API returns { users: [] }
        this.calculateTotalPages(); 
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );
  }
    // Calculate total pages based on the number of users
    calculateTotalPages(): void {
      this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    }

    // Get users for the current page
    getPaginatedUsers(): any[] {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.users.slice(startIndex, endIndex);
    }

    // Go to the next page
    nextPage(): void {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    }

    // Go to the previous page
    previousPage(): void {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    }

    // Go to a specific page
    goToPage(page: number): void {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }
  

  // Open modal for adding a new user
  openAddUserModal(): void {
    this.isEditMode = false;
    this.userForm.reset({ role: 'user' }); // Reset form with default role
    this.isModalOpen = true;
  }

  // Open modal for editing a user
  openEditUserModal(user: any): void {
    this.isEditMode = true;
    this.selectedUser = user;
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: user.password,
      role: user.role, // Include role when patching the form
    });
    this.isModalOpen = true;
  }

  // Close the modal
  closeModal(): void {
    this.isModalOpen = false;
  }

  // Handle form submission
  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    const userData = this.userForm.value;

    if (this.isEditMode) {
      // Update existing user
      this.userService.updateUser(this.selectedUser.id, userData).subscribe(
        (response) => {
          this.showSuccessMessage('User updated successfully!');
          this.closeModal();
          this.loadUsers(); // Reload users after update
        },
        (error) => {
          console.error('Error updating user:', error);
        }
      );
    } else {
      // Create new user
      this.userService.registerUser(userData).subscribe(
        (response) => {
          this.showSuccessMessage('User created successfully!');
          this.closeModal();
          this.loadUsers(); // Reload users after creation
        },
        (error) => {
          console.error('Error creating user:', error);
        }
      );
    }
  }

  // Show confirmation dialog before deleting a user
  confirmDeleteUser(user: any): void {
    this.userToDelete = user;
    this.showConfirmation = true;
  }

  // Confirm deletion
  confirmDelete(): void {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id).subscribe(
        () => {
          this.showSuccessMessage('User deleted successfully!');
          this.cancelDelete();
          this.loadUsers(); // Reload users after deletion
        },
        (error) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }

  // Cancel deletion
  cancelDelete(): void {
    this.userToDelete = null;
    this.showConfirmation = false;
  }

  // Switch user role
  updateUserRole(user: any): void {
    this.userService.switchUserRole(user.id).subscribe(
      (response) => {
        user.role = response.user.role; // Assuming the API returns { user: {} }
        this.showSuccessMessage('User role updated successfully!');
        this.loadUsers(); // Reload users after role switch
      },
      (error) => {
        console.error('Error switching role:', error);
      }
    );
  }

  // Show success message
  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000); // Hide the message after 3 seconds
  }
}