import { Component, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProveedorService } from '../../service/proveedor/proveedor.service';
import { ProveedorModel } from '../../model/proveedor-model';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-proveedor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit, AfterViewInit, OnDestroy {
  
  listProveedor: ProveedorModel[] = [];
  formProveedor!: FormGroup;
  isUpdate: boolean = false;
  private dataTable: any = null;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private proveedorService: ProveedorService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initForm();
  }

  ngOnInit() {
    this.list();
  }

  ngAfterViewInit() {
    // Inicialización después de la vista si es necesario
  }

  ngOnDestroy() {
    this.destroyDataTable();
  }

  initForm() {
    this.formProveedor = this.fb.group({
      id: [0],
      razon_social: ['', Validators.required],
      ruc: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      estado: [true]
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
      } else if ($.fn.DataTable && $.fn.DataTable.isDataTable('#proveedorTable')) {
        $('#proveedorTable').DataTable().destroy();
        console.log('DataTable destruido via jQuery');
      }

    } catch (error) {
      console.warn('Error al destruir DataTable:', error);
    }
  }

  initDataTable() {
    if (!this.isBrowser) return;

    const tableSelector = '#proveedorTable';

    if ($.fn.DataTable.isDataTable(tableSelector)) {
      console.log('DataTable existe, actualizando datos...');
      this.dataTable.clear();
      this.dataTable.rows.add(this.listProveedor);
      this.dataTable.draw();
      return;
    }

    console.log('Inicializando DataTable por primera vez con', this.listProveedor.length, 'proveedores');
    
    this.dataTable = $(tableSelector).DataTable({
      data: this.listProveedor,
      columns: [
        { data: 'id', title: 'ID' },
        { data: 'razon_social', title: 'RAZÓN SOCIAL' },
        { data: 'ruc', title: 'RUC', className: 'text-center' },
        { data: 'direccion', title: 'DIRECCIÓN' },
        { data: 'telefono', title: 'TELÉFONO', className: 'text-center' },
        { 
          data: 'estado', 
          title: 'ESTADO',
          className: 'text-center',
          render: (data: any) => data ? 
            '<span class="badge bg-success">Activo</span>' : 
            '<span class="badge bg-danger">Inactivo</span>'
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
          `
        }
      ],
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
        loadingRecords: 'Cargando...',
        processing: 'Procesando...'
      },
      pageLength: 10,
      lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Todos"]],
      order: [[0, 'desc']],
      dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip',
      initComplete: () => {
        console.log('DataTable inicializado completamente');
        const table = $('#proveedorTable');

        table.on('click', '.btn-ver', (event: any) => {
          const id = $(event.currentTarget).data('id');
          const proveedor = this.listProveedor.find(p => p.id === id);
          if (proveedor) {
            this.verDetalles(proveedor);
          }
        });

        table.on('click', '.btn-editar', (event: any) => {
          const id = $(event.currentTarget).data('id');
          const proveedor = this.listProveedor.find(p => p.id === id);
          if (proveedor) {
            this.selectItem(proveedor);
            const modal = new bootstrap.Modal(document.getElementById('proveedorModal'));
            modal.show();
          }
        });

        table.on('click', '.btn-eliminar', (event: any) => {
          const id = $(event.currentTarget).data('id');
          this.delete(id);
        });
      }
    });
  }

  recargarTabla() {
    console.log('Recargando datos de la tabla...');
    
    this.proveedorService.getAll().subscribe({
      next: (resp) => {
        if (resp) {
          this.listProveedor = resp;
          console.log('Datos actualizados:', this.listProveedor.length, 'proveedores');
          
          this.cdr.detectChanges();

          if (this.dataTable) {
            console.log('Actualizando DataTable existente');
            this.dataTable.clear();
            this.dataTable.rows.add(this.listProveedor);
            this.dataTable.draw();
          } else {
            console.log('Inicializando nuevo DataTable');
            setTimeout(() => this.initDataTable(), 300);
          }
        }
      },
      error: (err) => {
        console.error('Error al recargar proveedores:', err);
        alert('Error al recargar proveedores');
      }
    });
  }

  list() {
    console.log('Cargando lista inicial de proveedores...');
    
    this.proveedorService.getAll().subscribe({
      next: (resp) => {
        if (resp) {
          this.listProveedor = resp;
          console.log('Proveedores cargados:', this.listProveedor.length);
          
          this.cdr.detectChanges();

          if (!this.dataTable && this.isBrowser) {
            setTimeout(() => {
              this.initDataTable();
            }, 300);
          } else if (this.dataTable) {
            this.dataTable.clear();
            this.dataTable.rows.add(this.listProveedor);
            this.dataTable.draw();
          }
        }
      },
      error: (err) => {
        console.error('Error al obtener proveedores:', err);
        alert('Error al cargar proveedores');
      }
    });
  }

  newRol() {
    this.isUpdate = false;
    this.formProveedor.reset({
      id: 0,
      estado: true
    });
  }

  selectItem(item: any) {
    this.isUpdate = true;
    this.formProveedor.patchValue({
      id: item.id,
      razon_social: item.razon_social,
      ruc: item.ruc,
      direccion: item.direccion,
      telefono: item.telefono,
      estado: item.estado
    });
  }

  save() {
    if (this.formProveedor.valid) {
      console.log('Guardando proveedor...');
      
      this.proveedorService.save(this.formProveedor.value).subscribe({
        next: (resp) => {
          console.log('Proveedor guardado exitosamente');
          this.closeModal();
          alert('Proveedor guardado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 400);
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert('Error al guardar el proveedor');
        }
      });
    } else {
      alert('Por favor complete todos los campos requeridos');
      this.markFormGroupTouched(this.formProveedor);
    }
  }

  update() {
    if (this.formProveedor.valid) {
      console.log('Actualizando proveedor...');
      
      this.proveedorService.update(this.formProveedor.value).subscribe({
        next: (resp) => {
          console.log('Proveedor actualizado exitosamente');
          this.closeModal();
          alert('Proveedor actualizado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 400);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el proveedor');
        }
      });
    } else {
      alert('Por favor complete todos los campos requeridos');
      this.markFormGroupTouched(this.formProveedor);
    }
  }

  delete(id: number) {
    if (confirm('¿Está seguro de eliminar este proveedor?')) {
      this.proveedorService.delete(id).subscribe({
        next: (resp) => {
          console.log('Proveedor eliminado');
          alert('Proveedor eliminado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 200);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar el proveedor');
        }
      });
    }
  }

  verDetalles(item: any) {
    const detalles = `
Detalles del Proveedor
======================
ID: ${item.id}
Razón Social: ${item.razon_social}
RUC: ${item.ruc}
Dirección: ${item.direccion}
Teléfono: ${item.telefono}
Estado: ${item.estado ? 'Activo' : 'Inactivo'}
    `;
    alert(detalles);
  }

  closeModal() {
    if (!this.isBrowser) return;

    const modalElement = document.getElementById('proveedorModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getProveedoresActivos(): number {
    return this.listProveedor.filter(p => p.estado === true).length;
  }

  getProveedoresInactivos(): number {
    return this.listProveedor.filter(p => p.estado === false).length;
  }
}