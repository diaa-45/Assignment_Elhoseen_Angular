import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError, Observable } from 'rxjs';

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiration?: string;
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Clone request if token exists
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        // Attempt refresh token
        return authService.refreshToken().pipe(
          switchMap((res: AuthResponse) => {
            if (res?.accessToken) {
              // Replay the original request with new token
              const newReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` }
              });
              return next(newReq); // Correctly typed Observable<HttpEvent<unknown>>
            }
            authService.logout();
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
