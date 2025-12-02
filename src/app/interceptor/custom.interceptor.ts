import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from '../service/login/login.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const customInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const token = loginService.getToken();

  // Clonar request y agregar token si existe
  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Manejar errores de autenticación
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        // Token expirado o inválido
        console.error('Error de autenticación:', error.error?.message || 'No autorizado');
        
        // Limpiar sesión y redirigir al login
        loginService.logout();
        
        // Mostrar mensaje al usuario
        if (error.error?.message) {
          alert(error.error.message);
        }
      }
      
      return throwError(() => error);
    })
  );
};