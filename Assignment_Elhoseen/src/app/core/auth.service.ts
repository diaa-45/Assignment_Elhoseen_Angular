import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, tap, throwError } from 'rxjs';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiration: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7265/api/auth';
  private userSubject = new BehaviorSubject<boolean>(this.hasToken());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { userName: username, password })
      .pipe(
        tap(res => {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          this.userSubject.next(true);
        }),
        catchError(err => {
          console.error('Login error:', err);
          return of(null);
        })
      );
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.userSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, refreshToken, { responseType: 'json' })
      .pipe(
        tap(res => {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
        })
      );
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}
