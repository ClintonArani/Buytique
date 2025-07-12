import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {
  activeTab: string = 'overview';
  isSidebarVisible: boolean = false;
  isDarkMode: boolean = false;
  userFullName!: string;
  userEmail: string = '';
  userAvatar: string = 'assets/image2.png';
  userId!: string;

  // Profile photo modal properties
  showProfilePhotoModal: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  isLoading: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit() {
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

  // Profile photo methods
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
        this.showSuccess('Profile photo updated successfully!');
      }
    } catch (error) {
      console.error('Profile photo upload failed:', error);
      this.showSuccess('Failed to upload profile photo. Please try again.', false);
    } finally {
      this.isLoading = false;
      this.closeProfilePhotoModal();
    }
  }

  private showSuccess(message: string, isSuccess: boolean = true) {
    this.successMessage = message;
    this.showSuccessMessage = true;
    
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 2000);
  }

  // Navigation methods
  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.hideSidebarOnSmallScreen();
  }

  history() {
    this.router.navigate(['/info/history']);
    this.setActiveTab('history');
  }

  logout() {
    this.router.navigate(['/home']);
  }
  overview(){
    this.router.navigate(['/info/overview']);
    this.setActiveTab('overview');
  }

  // UI methods
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

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth > 768) {
      this.isSidebarVisible = false;
    }
  }
}