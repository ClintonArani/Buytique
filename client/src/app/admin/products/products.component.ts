import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { CategoriesService } from '../../services/categories.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TruncatePipe } from '../../pipes/truncate.pipe'; 

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TruncatePipe],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  productForm!: FormGroup;
  products: any[] = [];
  categories: any[] = [];
  isEditMode = false;
  selectedProduct: any = null;
  isModalOpen = false;
  successMessage: string | null = null;
  showConfirmation: boolean = false;
  productToDelete: any = null;
  selectedFile: File | null = null;
  imagePreview: SafeUrl | string | null = null;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoriesService: CategoriesService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProducts();
    this.loadCategories();
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock_quantity: ['', [Validators.required, Validators.min(0)]],
      category_id: ['', Validators.required],
      image: [null],
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe(
      (response) => {
        this.products = response.products.map((product: any) => ({
          ...product,
          image_path: `http://localhost:3900/${product.image_path}`
        }));
        this.calculateTotalPages();
      },
      (error) => {
        console.error('Error loading products:', error);
      }
    );
  }

  loadCategories(): void {
    this.categoriesService.getAllCategories().subscribe(
      (response) => {
        this.categories = response.categories;
      },
      (error) => {
        console.error('Error loading categories:', error);
      }
    );
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);
  }

  getPaginatedProducts(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.products.slice(startIndex, endIndex);
  }

  openAddProductModal(): void {
    this.isEditMode = false;
    this.productForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.isModalOpen = true;
  }

  openEditProductModal(product: any): void {
    this.isEditMode = true;
    this.selectedProduct = product;
    this.imagePreview = product.image_path;
    
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id
    });

    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedProduct = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        this.showSuccessMessage('Only image files are allowed!');
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2097152) {
        this.showSuccessMessage('Image must be less than 2MB!');
        return;
      }

      this.selectedFile = file;
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    fileInput.click();
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value);
    formData.append('stock_quantity', this.productForm.get('stock_quantity')?.value);
    formData.append('category_id', this.productForm.get('category_id')?.value);

    // Handle image
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    } else if (this.isEditMode && !this.selectedFile && this.selectedProduct?.image_path) {
      // Keep existing image if no new file was selected during edit
      formData.append('image_path', this.selectedProduct.image_path.replace('http://localhost:3900/', ''));
    }

    if (this.isEditMode) {
      this.productService.updateProduct(this.selectedProduct.id, formData).subscribe(
        (response) => {
          this.showSuccessMessage('Product updated successfully!');
          this.closeModal();
          this.loadProducts();
        },
        (error) => {
          console.error('Error updating product:', error);
        }
      );
    } else {
      this.productService.addProduct(formData).subscribe(
        (response) => {
          this.showSuccessMessage('Product created successfully!');
          this.closeModal();
          this.loadProducts();
        },
        (error) => {
          console.error('Error creating product:', error);
        }
      );
    }
  }

  confirmDeleteProduct(product: any): void {
    this.productToDelete = product;
    this.showConfirmation = true;
  }

  confirmDelete(): void {
    if (this.productToDelete) {
      this.productService.deleteProduct(this.productToDelete.id).subscribe(
        () => {
          this.showSuccessMessage('Product deleted successfully!');
          this.cancelDelete();
          this.loadProducts();
        },
        (error) => {
          console.error('Error deleting product:', error);
        }
      );
    }
  }

  cancelDelete(): void {
    this.productToDelete = null;
    this.showConfirmation = false;
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

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
}