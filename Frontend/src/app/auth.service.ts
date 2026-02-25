import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface TokenPayload {
  sub?: string;
  unique_name?: string;
  name?: string;
  exp?: number;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkAuthenticated());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private tokenCheckInterval: ReturnType<typeof setInterval> | null = null;
  private visibilityHandler: (() => void) | null = null;

  constructor() {
    // Start periodic token validation
    this.startTokenValidation();

    // Check token when user returns to the tab
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.validateAuthState();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    this.stopTokenValidation();
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  // ─── Token Utilities ───────────────────────────────────────────────────────

  getTokenPayload(): TokenPayload | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])) as TokenPayload;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const payload = this.getTokenPayload();
    if (!payload?.exp) return true;
    return payload.exp < Math.floor(Date.now() / 1000);
  }

  // ─── Auth State ────────────────────────────────────────────────────────────

  /** Returns true only if a token exists AND is not expired. */
  isAuthenticated(): boolean {
    return this.checkAuthenticated();
  }

  private checkAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return !this.isTokenExpired();
  }

  /** Validates current auth state and updates the observable if token expired */
  validateAuthState(): void {
    const isValid = this.checkAuthenticated();
    const currentState = this.isLoggedInSubject.getValue();

    // If state changed (was logged in, now token expired)
    if (currentState !== isValid) {
      if (!isValid) {
        // Token expired - clean up
        this.logout();
      } else {
        this.isLoggedInSubject.next(true);
      }
    }
  }

  // ─── Token Validation Timer ────────────────────────────────────────────────

  private startTokenValidation(): void {
    // Check every 30 seconds if token is still valid
    this.tokenCheckInterval = setInterval(() => {
      this.validateAuthState();
    }, 30000);
  }

  private stopTokenValidation(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  // ─── Session Management ────────────────────────────────────────────────────

  login(token: string, username?: string): void {
    localStorage.setItem('token', token);

    const payload = this.getTokenPayload();
    if (payload) {
      localStorage.setItem('user', JSON.stringify({
        id: payload.sub ?? '',
        username: payload.unique_name ?? payload.name ?? username ?? 'User'
      }));
    } else if (username) {
      localStorage.setItem('user', JSON.stringify({ id: '', username }));
    }

    this.isLoggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
  }

  /** Call this when receiving a 401 response from the API */
  handleUnauthorized(): void {
    this.logout();
  }
}