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
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Manejar errores de autenticación
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        // Limpiar sesión y redirigir al logi

        // Mostrar mensaje al usuario
        if (error.error?.message) {
          window.alert(error.error.message);
        }
      }

      return throwError(() => error);
    })
  );
};
