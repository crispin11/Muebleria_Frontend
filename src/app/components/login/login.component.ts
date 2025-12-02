import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../service/login/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,   // ✅ Para *ngIf
    FormsModule     // ✅ Para [(ngModel)]
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  correo: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  login() {
    if (!this.correo || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.loginService.login(this.correo, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Login exitoso:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error de login:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas';
        } else if (error.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor';
        } else {
          this.errorMessage = error.error?.message || 'Error en el servidor. Intenta más tarde.';
        }
      }
    });
  }
}