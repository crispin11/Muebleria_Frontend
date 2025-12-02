import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { UsuarioModel } from '../../model/usuario-model';
import { RoleModel } from '../../model/Role-model';
import { RoleService } from '../../service/role/role.service';

declare var $: any;
declare var bootstrap: any;

// Clase PasswordValidator dentro del mismo archivo
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

  static calculateStrength(password: string): {
    level: string;
    percentage: number;
    color: string;
  } {
    if (!password) {
      return { level: 'Sin contraseña', percentage: 0, color: 'secondary' };
    }

    let strength = 0;

    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 10;

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

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
})
export class UsuarioComponent implements OnInit, AfterViewInit, OnDestroy {
  listUsuario: UsuarioModel[] = [];
  listRoles: RoleModel[] = [];
  formUsuario!: FormGroup;
  isUpdate: boolean = false;
  private dataTable: any = null;
  private isBrowser: boolean;

  // Para mostrar la fortaleza de la contraseña
  passwordStrength = { level: '', percentage: 0, color: 'secondary' };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private usuarioService: UsuarioService,
    private rolService: RoleService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initForm();
  }

  ngOnInit() {
    this.list();
    this.loadRoles();
  }

  ngAfterViewInit() {
    // Inicialización después de la vista si es necesario
  }

  ngOnDestroy() {
    this.destroyDataTable();
  }

  initForm() {
    this.formUsuario = this.fb.group({
      id: [0],
      nombre: ['', Validators.required],
      apellido_pa: ['', Validators.required],
      apellido_ma: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          PasswordValidator.strong(),
        ],
      ],
      role: ['', Validators.required],
      estado: [true],
    });

    // Escuchar cambios en el campo de contraseña
    this.formUsuario.get('password')?.valueChanges.subscribe((password) => {
      this.passwordStrength = PasswordValidator.calculateStrength(password);
    });
  }

  // Método para obtener los errores de contraseña
  getPasswordErrors(): string[] {
    const control = this.formUsuario.get('password');
    if (control?.errors && control.touched) {
      const errors = control.errors['passwordStrength'];
      if (errors) {
        const messages: string[] = [];
        if (!errors.isLengthValid) messages.push('Mínimo 8 caracteres');
        if (!errors.hasUpperCase) messages.push('Una letra mayúscula');
        if (!errors.hasLowerCase) messages.push('Una letra minúscula');
        if (!errors.hasNumeric) messages.push('Un número');
        if (!errors.hasSpecialChar)
          messages.push('Un carácter especial (!@#$%^&*)');
        return messages;
      }
    }
    return [];
  }

  loadRoles() {
    this.rolService.getUsuario().subscribe({
      next: (resp) => {
        if (resp) {
          this.listRoles = resp;
          console.log('Roles cargados:', this.listRoles.length);
        }
      },
      error: (err) => {
        console.error('Error al cargar roles:', err);
        alert('Error al cargar la lista de roles');
      },
    });
  }

  destroyDataTable() {
    if (!this.isBrowser) return;

    try {
      console.log('Destruyendo DataTable...');

      if (this.dataTable) {
        this.dataTable.destroy();
        this.dataTable = null;
        console.log('DataTable destruido correctamente');
      } else if (
        $.fn.DataTable &&
        $.fn.DataTable.isDataTable('#usuarioTable')
      ) {
        $('#usuarioTable').DataTable().destroy();
        console.log('DataTable destruido via jQuery');
      }
    } catch (error) {
      console.warn('Error al destruir DataTable:', error);
    }
  }

  initDataTable() {
    if (!this.isBrowser) return;

    const tableSelector = '#usuarioTable';

    if ($.fn.DataTable.isDataTable(tableSelector)) {
      console.log('DataTable existe, actualizando datos...');
      this.dataTable.clear();
      this.dataTable.rows.add(this.listUsuario);
      this.dataTable.draw();
      return;
    }

    console.log(
      'Inicializando DataTable por primera vez con',
      this.listUsuario.length,
      'usuarios'
    );

    this.dataTable = $(tableSelector).DataTable({
      data: this.listUsuario,
      columns: [
        { data: 'id', title: 'ID' },
        { data: 'nombre', title: 'NOMBRE' },
        { data: 'apellido_pa', title: 'APELLIDO PATERNO' },
        { data: 'apellido_ma', title: 'APELLIDO MATERNO' },
        { data: 'correo', title: 'CORREO' },
        {
          data: 'password',
          title: 'PASSWORD',
          render: (data: any) => '********',
        },
        {
          data: 'role',
          title: 'ROL',
          className: 'text-center',
          render: (data: any) => `<span class="badge bg-info">${data}</span>`,
        },
        {
          data: 'estado',
          title: 'ESTADO',
          className: 'text-center',
          render: (data: any) =>
            data
              ? '<span class="badge bg-success">Activo</span>'
              : '<span class="badge bg-danger">Inactivo</span>',
        },
        {
          data: null,
          title: 'ACCIONES',
          orderable: false,
          className: 'text-center',
          render: (data: any, type: any, row: any) => `
            <button class="btn btn-sm btn-info btn-ver" data-id="${row.id}" title="Ver detalles">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-warning btn-editar" data-id="${row.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${row.id}" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          `,
        },
      ],
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
        loadingRecords: 'Cargando...',
        processing: 'Procesando...',
      },
      pageLength: 10,
      lengthMenu: [
        [5, 10, 25, 50, -1],
        [5, 10, 25, 50, 'Todos'],
      ],
      order: [[0, 'desc']],
      dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip',
      initComplete: () => {
        console.log('DataTable inicializado completamente');
        const table = $('#usuarioTable');

        table.on('click', '.btn-ver', (event: any) => {
          const id = $(event.currentTarget).data('id');
          const usuario = this.listUsuario.find((u) => u.id === id);
          if (usuario) {
            this.verDetalles(usuario);
          }
        });

        table.on('click', '.btn-editar', (event: any) => {
          const id = $(event.currentTarget).data('id');
          const usuario = this.listUsuario.find((u) => u.id === id);
          if (usuario) {
            this.selectItem(usuario);
            const modal = new bootstrap.Modal(
              document.getElementById('usuarioModal')
            );
            modal.show();
          }
        });

        table.on('click', '.btn-eliminar', (event: any) => {
          const id = $(event.currentTarget).data('id');
          this.delete(id);
        });
      },
    });
  }

  recargarTabla() {
    console.log('Recargando datos de la tabla...');

    this.usuarioService.getUsuario().subscribe({
      next: (resp) => {
        if (resp) {
          this.listUsuario = resp;
          console.log(
            'Datos actualizados:',
            this.listUsuario.length,
            'usuarios'
          );

          this.cdr.detectChanges();

          if (this.dataTable) {
            console.log('Actualizando DataTable existente');
            this.dataTable.clear();
            this.dataTable.rows.add(this.listUsuario);
            this.dataTable.draw();
          } else {
            console.log('Inicializando nuevo DataTable');
            setTimeout(() => this.initDataTable(), 300);
          }
        }
      },
      error: (err) => {
        console.error('Error al recargar usuarios:', err);
        alert('Error al recargar usuarios');
      },
    });
  }

  list() {
    console.log('Cargando lista inicial de usuarios...');

    this.usuarioService.getUsuario().subscribe({
      next: (resp) => {
        if (resp) {
          this.listUsuario = resp;
          console.log('Usuarios cargados:', this.listUsuario.length);

          this.cdr.detectChanges();

          if (!this.dataTable && this.isBrowser) {
            setTimeout(() => {
              this.initDataTable();
            }, 300);
          } else if (this.dataTable) {
            this.dataTable.clear();
            this.dataTable.rows.add(this.listUsuario);
            this.dataTable.draw();
          }
        }
      },
      error: (err) => {
        console.error('Error al obtener usuarios:', err);
        alert('Error al cargar usuarios');
      },
    });
  }

  newUsuario() {
    this.isUpdate = false;
    this.passwordStrength = { level: '', percentage: 0, color: 'secondary' };
    this.formUsuario.reset({
      id: 0,
      estado: true,
    });
  }

  selectItem(item: any) {
    this.isUpdate = true;
    this.passwordStrength = { level: '', percentage: 0, color: 'secondary' };
    this.formUsuario.patchValue({
      id: item.id,
      nombre: item.nombre,
      apellido_pa: item.apellido_pa,
      apellido_ma: item.apellido_ma,
      correo: item.correo,
      password: item.password,
      role: item.role,
      estado: item.estado,
    });
  }

  save() {
    if (this.formUsuario.valid) {
      console.log('Guardando usuario...');

      this.usuarioService.saveUsuario(this.formUsuario.value).subscribe({
        next: (resp) => {
          console.log('Usuario guardado exitosamente');
          this.closeModal();
          alert('Usuario guardado exitosamente');

          setTimeout(() => {
            this.recargarTabla();
          }, 400);
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert('Error al guardar el usuario');
        },
      });
    } else {
      alert('Por favor complete todos los campos requeridos correctamente');
      this.markFormGroupTouched(this.formUsuario);
    }
  }

  update() {
    if (this.formUsuario.valid) {
      console.log('Actualizando usuario...');

      this.usuarioService.updateUsuario(this.formUsuario.value).subscribe({
        next: (resp) => {
          console.log('Usuario actualizado exitosamente');
          this.closeModal();
          alert('Usuario actualizado exitosamente');

          setTimeout(() => {
            this.recargarTabla();
          }, 400);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el usuario');
        },
      });
    } else {
      alert('Por favor complete todos los campos requeridos correctamente');
      this.markFormGroupTouched(this.formUsuario);
    }
  }

  delete(id: number) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.usuarioService.deleteUsuario(id).subscribe({
        next: (resp) => {
          console.log('Usuario eliminado');
          alert('Usuario eliminado exitosamente');

          setTimeout(() => {
            this.recargarTabla();
          }, 200);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar el usuario');
        },
      });
    }
  }

  verDetalles(item: any) {
    const detalles = `
Detalles del Usuario
====================
ID: ${item.id}
Nombre Completo: ${item.nombre} ${item.apellido_pa} ${item.apellido_ma}
Correo: ${item.correo}
Rol: ${item.role}
Estado: ${item.estado ? 'Activo' : 'Inactivo'}
    `;
    alert(detalles);
  }

  closeModal() {
    if (!this.isBrowser) return;

    const modalElement = document.getElementById('usuarioModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getUsuariosActivos(): number {
    return this.listUsuario.filter((u) => u.estado === true).length;
  }

  getUsuariosInactivos(): number {
    return this.listUsuario.filter((u) => u.estado === false).length;
  }

  getUsuariosPorRol(rolId: number): number {
    return this.listUsuario.filter((u) => Number(u.role) === rolId).length;
  }
}
