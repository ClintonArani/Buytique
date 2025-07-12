import { Component, OnInit } from '@angular/core';
import { CategoriesService } from '../../services/categories.service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categoryForm!: FormGroup;
  categories: any[] = []; // Initialize as empty array
  isEditMode = false;
  selectedCategory: any = null;
  isModalOpen = false;
  successMessage: string | null = null;
  showConfirmation: boolean = false;
  categoryToDelete: any = null;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;

  constructor(private fb: FormBuilder, private categoryService: CategoriesService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
  }

  initializeForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response?.categories || []; // Safe navigation with fallback
        this.calculateTotalPages();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories = []; // Ensure categories is always an array
        this.calculateTotalPages();
      }
    });
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.categories.length / this.itemsPerPage) || 1; // Ensure at least 1 page
  }

  getPaginatedCategories(): any[] {
    if (!this.categories || this.categories.length === 0) {
      return [];
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.categories.slice(startIndex, endIndex);
  }

  openAddCategoryModal(): void {
    this.isEditMode = false;
    this.selectedCategory = null;
    this.categoryForm.reset();
    this.isModalOpen = true;
  }

  openEditCategoryModal(category: any): void {
    this.isEditMode = true;
    this.selectedCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.categoryForm.reset();
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    const categoryData = this.categoryForm.value;

    if (this.isEditMode && this.selectedCategory) {
      this.categoryService.updateCategory(this.selectedCategory.id, categoryData).subscribe({
        next: (response) => {
          this.showSuccessMessage('Category updated successfully!');
          this.closeModal();
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error updating category:', error);
        }
      });
    } else {
      this.categoryService.addCategory(categoryData).subscribe({
        next: (response) => {
          this.showSuccessMessage('Category created successfully!');
          this.closeModal();
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error creating category:', error);
        }
      });
    }
  }

  confirmDeleteCategory(category: any): void {
    this.categoryToDelete = category;
    this.showConfirmation = true;
  }

  confirmDelete(): void {
    if (this.categoryToDelete) {
      this.categoryService.deleteCategory(this.categoryToDelete.id).subscribe({
        next: () => {
          this.showSuccessMessage('Category deleted successfully!');
          this.cancelDelete();
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
        }
      });
    }
  }

  cancelDelete(): void {
    this.categoryToDelete = null;
    this.showConfirmation = false;
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}