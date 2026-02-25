import { Component, NgZone } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  usernameFocused = false;
  passwordFocused = false;
  confirmFocused = false;
  showPassword = false;
  showConfirmPassword = false;

  private readonly url = environment.apiBaseUrl + '/User/Register';

  constructor(
    private http: HttpClient,
    private router: Router,
    private zone: NgZone
  ) {}

  register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    // confirmPassword is always required — removed the conditional that allowed
    // registration to proceed with a blank confirmation field
    if (!this.confirmPassword.trim()) {
      this.errorMessage = 'Please confirm your password';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    this.http.post(this.url, {
      username: this.username.trim(),
      password: this.password.trim()
    }).subscribe({
      next: () => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        this.isLoading = false;
        setTimeout(() => {
          this.zone.run(() => this.router.navigate(['/login']));
        }, 2000);
      },
      error: (err) => {
        if (err.status === 409) {
          this.errorMessage = 'Username already exists. Please choose a different username.';
        } else if (err.status === 400) {
          this.errorMessage = 'Invalid registration data. Please check your inputs.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }

  clearForm(): void {
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  getPasswordStrength(): number {
    if (!this.password) return 0;
    let strength = 0;
    if (this.password.length >= 6)  strength += 20;
    if (this.password.length >= 8)  strength += 15;
    if (this.password.length >= 12) strength += 15;
    if (/[a-z]/.test(this.password))        strength += 10;
    if (/[A-Z]/.test(this.password))        strength += 15;
    if (/[0-9]/.test(this.password))        strength += 15;
    if (/[^a-zA-Z0-9]/.test(this.password)) strength += 10;
    return Math.min(strength, 100);
  }
}