import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ProfileService } from '../services/profile.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  activeTab: string = 'overview';
  isSidebarVisible: boolean = false;
  isDarkMode: boolean = false;
  notificationsCount: number = 3;
  isLoading: boolean = false;
  userFullName!: string;
  userEmail: string = '';
  userAvatar: string = 'assets/image2.png';
  userId!: string;

  // New properties for profile photo modal
  showProfilePhotoModal: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  showSuccessMessage: boolean = false;
  successMessage: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.simulateLoading();
    this.simulateRealTimeNotifications();
    this.loadUserFromToken();
  }

  loadUserFromToken() {
    const userData = this.userService.getCurrentUserFromToken();
    if (userData) {
      this.userFullName = `${userData.firstName} ${userData.lastName}`.trim();
      this.userId = userData.id;
      this.userEmail = userData.email;
      
      if (userData.profile) {
        this.userAvatar = `http://localhost:3900/${userData.profile}`;
      }
    }
  }

  openProfilePhotoModal() {
    this.showProfilePhotoModal = true;
  }

  closeProfilePhotoModal() {
    this.showProfilePhotoModal = false;
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async uploadProfilePhoto() {
    if (!this.selectedFile || !this.userId) return;

    try {
      this.isLoading = true;
      const response = this.userAvatar !== 'assets/image2.png'
        ? await lastValueFrom(this.profileService.updateProfilePhoto(this.userId, this.selectedFile))
        : await lastValueFrom(this.profileService.addProfilePhoto(this.userId, this.selectedFile));

      if (response && response.profilePath) {
        this.userAvatar = `http://localhost:3900/${response.profilePath}`;
        this.showSuccessMessage = true;
        this.successMessage = 'Profile photo updated successfully!';
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 2000);
      }
    } catch (error) {
      console.error('Profile photo upload failed:', error);
      this.showSuccessMessage = true;
      this.successMessage = 'Failed to upload profile photo';
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 2000);
    } finally {
      this.isLoading = false;
      this.closeProfilePhotoModal();
    }
  }

  onLogout(event: Event) {
    event.preventDefault();
    this.authService.logout().subscribe({
      next: (response) => {
        console.log(response.message);
      },
      error: (err) => {
        console.error('Logout failed:', err);
      },
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.hideSidebarOnSmallScreen();
  }

  toggleSidebar(event: Event) {
    event.stopPropagation();
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  hideSidebarOnSmallScreen() {
    if (window.innerWidth <= 768) {
      this.isSidebarVisible = false;
    }
  }

  hideSidebarOnOutsideClick() {
    if (this.isSidebarVisible && window.innerWidth <= 768) {
      this.isSidebarVisible = false;
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  simulateLoading() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  simulateRealTimeNotifications() {
    setInterval(() => {
      this.notificationsCount = Math.floor(Math.random() * 10);
    }, 5000);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth > 768) {
      this.isSidebarVisible = false;
    }
  }
}