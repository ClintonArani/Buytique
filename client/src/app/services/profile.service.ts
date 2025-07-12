import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:3900/users';

  constructor(private http: HttpClient) {}

  addProfilePhoto(userId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    return this.http.post(`${this.apiUrl}/${userId}/profile-photo`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfilePhoto(userId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    return this.http.put(`${this.apiUrl}/${userId}/profile-photo`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}