import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-diagnostic',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: monospace; max-width: 800px; margin: 0 auto;">
      <h2>Cart Diagnostic Tool</h2>
      
      <button (click)="runDiagnostics()" 
              style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">
        Run Full Diagnostics
      </button>

      <div *ngIf="results.length > 0" style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
        <div *ngFor="let result of results" 
             [style.color]="getStatusColor(result.status)"
             style="margin: 5px 0; padding: 5px;">
          [{{ result.status }}] {{ result.message }}
          <div *ngIf="result.details" style="margin-left: 20px; color: #666; font-size: 12px; white-space: pre-wrap;">
            {{ result.details }}
          </div>
        </div>
      </div>

      <div *ngIf="showTestButton" style="margin-top: 20px;">
        <button (click)="testAddToCart()" 
                style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Test Add to Cart (Product ID: 1)
        </button>
      </div>

      <div *ngIf="testResult !== null" 
           [style.background]="getBackgroundColor()"
           [style.color]="getTextColor()"
           style="margin-top: 20px; padding: 15px; border-radius: 5px;">
        <strong>{{ testResult.success ? 'SUCCESS' : 'FAILED' }}</strong>
        <div style="margin-top: 10px;">{{ testResult.message }}</div>
        <div *ngIf="testResult.details" style="margin-top: 10px; font-size: 12px;">
          Details: {{ testResult.details }}
        </div>
      </div>
    </div>
  `
})
export class DiagnosticComponent {
  results: any[] = [];
  showTestButton = false;
  testResult: any = null;

  constructor(private http: HttpClient) {}

  getStatusColor(status: string): string {
    if (status === 'OK') return 'green';
    if (status === 'ERROR') return 'red';
    if (status === 'WARN') return 'orange';
    return 'blue';
  }

  getBackgroundColor(): string {
    return this.testResult?.success ? '#d4edda' : '#f8d7da';
  }

  getTextColor(): string {
    return this.testResult?.success ? '#155724' : '#721c24';
  }

  runDiagnostics() {
    this.results = [];
    this.showTestButton = false;
    this.testResult = null;

    // 1. Check token exists
    const token = localStorage.getItem('token');
    if (token) {
      this.results.push({
        status: 'OK',
        message: 'Token found in localStorage',
        details: `Token preview: ${token.substring(0, 50)}...`
      });

      // 2. Check token format
      const parts = token.split('.');
      if (parts.length === 3) {
        this.results.push({
          status: 'OK',
          message: 'Token has valid JWT format (3 parts)'
        });

        // 3. Decode token payload
        try {
          const payload = JSON.parse(atob(parts[1]));
          this.results.push({
            status: 'OK',
            message: 'Token payload decoded successfully',
            details: JSON.stringify(payload, null, 2)
          });

          // 4. Check for 'sub' claim
          if (payload.sub) {
            this.results.push({
              status: 'OK',
              message: `User ID (sub) found: ${payload.sub}`
            });
          } else {
            this.results.push({
              status: 'ERROR',
              message: 'Token missing "sub" claim - backend cannot identify user!'
            });
          }

          // 5. Check token expiration
          if (payload.exp) {
            const now = Math.floor(Date.now() / 1000);
            const expired = payload.exp < now;
            if (expired) {
              this.results.push({
                status: 'ERROR',
                message: 'Token is EXPIRED - please login again'
              });
            } else {
              const minutesLeft = Math.floor((payload.exp - now) / 60);
              this.results.push({
                status: 'OK',
                message: `Token valid for ${minutesLeft} more minutes`
              });
            }
          }
        } catch (e) {
          this.results.push({
            status: 'ERROR',
            message: 'Failed to decode token payload',
            details: String(e)
          });
        }
      } else {
        this.results.push({
          status: 'ERROR',
          message: 'Token has invalid format (not a valid JWT)'
        });
      }
    } else {
      this.results.push({
        status: 'ERROR',
        message: 'No token found - user is not logged in'
      });
      return;
    }

    // 6. Check user data
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        this.results.push({
          status: 'OK',
          message: 'User data found',
          details: JSON.stringify(user, null, 2)
        });
      } catch (e) {
        this.results.push({
          status: 'WARN',
          message: 'User data exists but cannot be parsed'
        });
      }
    } else {
      this.results.push({
        status: 'WARN',
        message: 'No user data in localStorage (not critical)'
      });
    }

    // 7. Check API base URL
    this.results.push({
      status: 'INFO',
      message: `API Base URL: ${environment.apiBaseUrl}`
    });

    // Show test button if token is valid
    this.showTestButton = !!(token && token.split('.').length === 3);
  }

  testAddToCart() {
    this.testResult = null;
    const url = environment.apiBaseUrl + '/CartItem/NewCartItem';

    this.testResult = {
      success: false,
      message: 'Testing...'
    };

    this.http.post(url, {
      productId: 1,
      quantity: 1
    }).subscribe({
      next: (response) => {
        this.testResult = {
          success: true,
          message: 'Add to cart works perfectly!',
          details: 'Product ID 1 was added to cart successfully'
        };
      },
      error: (err) => {
        let message = 'Failed to add to cart';
        let details = '';

        if (err.status === 0) {
          message = 'Cannot connect to backend server';
          details = `Make sure your backend is running at ${environment.apiBaseUrl}`;
        } else if (err.status === 401) {
          message = 'Unauthorized - Token is invalid or expired';
          details = 'Backend rejected the token. Try logging in again.';
        } else if (err.status === 400) {
          message = 'Bad Request';
          details = err.error?.message || JSON.stringify(err.error);
        } else if (err.status === 404) {
          message = 'Product ID 1 not found in database';
          details = 'Backend endpoint works, but product doesn\'t exist';
        } else if (err.status === 500) {
          message = 'Backend server error';
          details = err.error?.message || 'Check backend logs';
        } else {
          details = `Status: ${err.status}, Message: ${err.statusText || err.message}`;
        }

        this.testResult = {
          success: false,
          message,
          details
        };
      }
    });
  }
}