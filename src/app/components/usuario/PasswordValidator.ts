import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidator {
  static strong(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        value
      );
      const isLengthValid = value.length >= 8;

      const passwordValid =
        hasUpperCase &&
        hasLowerCase &&
        hasNumeric &&
        hasSpecialChar &&
        isLengthValid;

      if (!passwordValid) {
        return {
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasSpecialChar,
            isLengthValid,
          },
        };
      }

      return null;
    };
  }

  /**
   * Calcula el nivel de fortaleza de la contraseña
   * @param password - Contraseña a evaluar
   * @returns Objeto con nivel y porcentaje de fortaleza
   */
  static calculateStrength(password: string): {
    level: string;
    percentage: number;
    color: string;
  } {
    if (!password) {
      return { level: 'Sin contraseña', percentage: 0, color: 'secondary' };
    }

    let strength = 0;

    // Longitud
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;

    // Mayúsculas
    if (/[A-Z]/.test(password)) strength += 20;

    // Minúsculas
    if (/[a-z]/.test(password)) strength += 20;

    // Números
    if (/[0-9]/.test(password)) strength += 20;

    // Caracteres especiales
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 10;

    // Determinar nivel
    let level = '';
    let color = '';

    if (strength < 40) {
      level = 'Muy débil';
      color = 'danger';
    } else if (strength < 60) {
      level = 'Débil';
      color = 'warning';
    } else if (strength < 80) {
      level = 'Media';
      color = 'info';
    } else if (strength < 100) {
      level = 'Fuerte';
      color = 'primary';
    } else {
      level = 'Muy fuerte';
      color = 'success';
    }

    return { level, percentage: strength, color };
  }
}
