// src/app/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if token is expired before making request
  const token = localStorage.getItem('token');
  if (token && authService.isTokenExpired()) {
    // Token expired - logout and don't send the request with invalid token
    authService.handleUnauthorized();
    router.navigate(['/login']);
    return throwError(() => new Error('Token expired'));
  }

  // Add token to request if available
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized responses
      if (error.status === 401) {
        authService.handleUnauthorized();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
