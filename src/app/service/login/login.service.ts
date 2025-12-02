import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import {
  Observable,
  tap,
  catchError,
  of,
  BehaviorSubject,
  throwError,
} from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private API_URL = 'https://muebleriaapis-production.up.railway.app/api/login';
  private tokenKey = 'authToken';

  // BehaviorSubject para manejar el estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Inicializar el estado de autenticación
    this.checkAuthStatus();
  }

  // Verificar estado inicial de autenticación
  private checkAuthStatus(): void {
    const isAuth = this.isAuthenticated();
    this.isAuthenticatedSubject.next(isAuth);

    // Si el token está expirado, hacer logout
    if (!isAuth && this.getToken()) {
      this.clearToken();
    }
  }

  // Inicia sesión y guarda el token
  login(correo: string, password: string): Observable<any> {
    return this.httpClient.post<any>(this.API_URL, { correo, password }).pipe(
      tap((response) => {
        if (response && response.token) {
          this.saveToken(response.token);
          this.isAuthenticatedSubject.next(true);
        } else {
          this.isAuthenticatedSubject.next(false);
        }
      }),
      catchError((error) => {
        this.isAuthenticatedSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  public saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.tokenKey, token);
    }
  }

  public getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const token = sessionStorage.getItem(this.tokenKey);

      // Verificar si el token está expirado
      if (token && this.isTokenExpired(token)) {
        this.clearToken();
        return null;
      }

      return token;
    }
    return null;
  }

  public clearToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.tokenKey);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      return expiry < now;
    } catch (e) {
      return true;
    }
  }

  public getTokenExpirationDate(): Date | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        return new Date(payload.exp * 1000);
      }
      return null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  logout(): void {
    this.clearToken();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getUserFromToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        username: payload.sub,
        roles: payload.roles || [],
        exp: payload.exp,
      };
    } catch (e) {
      return null;
    }
  }
}
