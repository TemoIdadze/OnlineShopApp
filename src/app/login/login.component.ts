import { Component, NgZone } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  usernameFocused: boolean = false;
  passwordFocused: boolean = false;
  showPassword: boolean = false;

  url: string = environment.apiBaseUrl + '/User/LogIn';

  constructor(
    private http: HttpClient,
    private router: Router,
    private zone: NgZone,
    private authService: AuthService
  ) {}

  login() {
    // Basic validation
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http.post(this.url, {
      username: this.username.trim(),
      password: this.password.trim()
    }, { responseType: 'text' }).subscribe({
      next: (token: string) => {
        if (token) {
          // Pass username to authService - it will handle storing both token and user
          this.authService.login(token, this.username.trim());

          this.zone.run(() => {
            this.router.navigate(['/']);
          });
        } else {
          this.errorMessage = 'Invalid response from server';
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = 'Invalid username or password';
        this.isLoading = false;
      }
    });
  }

  clearForm() {
    this.username = '';
    this.password = '';
    this.errorMessage = '';
  }
}