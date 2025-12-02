
import { Component, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../service/cliente/cliente.service';
import { ClienteModel } from '../../model/cliente-model';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit, AfterViewInit, OnDestroy {
  
  listCliente: ClienteModel[] = [];
  formCliente!: FormGroup;
  isUpdate: boolean = false;
  private dataTable: any = null;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private clienteservice: ClienteService,
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

  }

  ngOnDestroy() {
    this.destroyDataTable();
  }

  initForm() {
    this.formCliente = this.fb.group({
      id: [0],
      nombre: ['', Validators.required],
      apellido_pa: ['', Validators.required],
      apellido_ma: ['', Validators.required],
      dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
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
      } else if ($.fn.DataTable && $.fn.DataTable.isDataTable('#clienteTable')) {
        $('#clienteTable').DataTable().destroy();
        console.log('DataTable destruido via jQuery');
      }

    } catch (error) {
      console.warn('Error al destruir DataTable:', error);
    }
  }

  initDataTable() {
    if (!this.isBrowser) return;

    const tableSelector = '#clienteTable';

    if ($.fn.DataTable.isDataTable(tableSelector)) {
      console.log('DataTable existe, actualizando datos...');
      this.dataTable.clear();
      this.dataTable.rows.add(this.listCliente);
      this.dataTable.draw();
      return;
    }

    console.log('Inicializando DataTable por primera vez con', this.listCliente.length, 'clientes');
    
    this.dataTable = $(tableSelector).DataTable({
      data: this.listCliente,
      columns: [
        { data: 'id', title: 'ID' },
        { data: 'nombre', title: 'NOMBRE' },
        { data: 'apellido_pa', title: 'APELLIDO PATERNO' },
        { data: 'apellido_ma', title: 'APELLIDO MATERNO' },
        { data: 'dni', title: 'DNI', className: 'text-center' },
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
        const table = $('#clienteTable');

        table.on('click', '.btn-ver', (event: any) => {
          const id = $(event.currentTarget).data('id');
          const cliente = this.listCliente.find(c => c.id === id);
          if (cliente) {
            this.verDetalles(cliente);
          }
        });

        table.on('click', '.btn-editar', (event: any) => {
          const id = $(event.currentTarget).data('id');
          const cliente = this.listCliente.find(c => c.id === id);
          if (cliente) {
            this.selectItem(cliente);
            const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
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
    
    this.clienteservice.getAll().subscribe({
      next: (resp) => {
        if (resp) {
          this.listCliente = resp;
          console.log('Datos actualizados:', this.listCliente.length, 'clientes');
          
          this.cdr.detectChanges();

          if (this.dataTable) {
            console.log('Actualizando DataTable existente');
            this.dataTable.clear();
            this.dataTable.rows.add(this.listCliente);
            this.dataTable.draw();
          } else {
            console.log('Inicializando nuevo DataTable');
            setTimeout(() => this.initDataTable(), 300);
          }
        }
      },
      error: (err) => {
        console.error('Error al recargar clientes:', err);
        alert('Error al recargar clientes');
      }
    });
  }

  list() {
    console.log('Cargando lista inicial de clientes...');
    
    this.clienteservice.getAll().subscribe({
      next: (resp) => {
        if (resp) {
          this.listCliente = resp;
          console.log('Clientes cargados:', this.listCliente.length);
          
          this.cdr.detectChanges();

          if (!this.dataTable && this.isBrowser) {
            setTimeout(() => {
              this.initDataTable();
            }, 300);
          } else if (this.dataTable) {
            this.dataTable.clear();
            this.dataTable.rows.add(this.listCliente);
            this.dataTable.draw();
          }
        }
      },
      error: (err) => {
        console.error('Error al obtener clientes:', err);
        alert('Error al cargar clientes');
      }
    });
  }

  newRol() {
    this.isUpdate = false;
    this.formCliente.reset({
      id: 0,
      estado: true
    });
  }

  selectItem(item: any) {
    this.isUpdate = true;
    this.formCliente.patchValue({
      id: item.id,
      nombre: item.nombre,
      apellido_pa: item.apellido_pa,
      apellido_ma: item.apellido_ma,
      dni: item.dni,
      telefono: item.telefono,
      estado: item.estado
    });
  }

  save() {
    if (this.formCliente.valid) {
      console.log('Guardando cliente...');
      
      this.clienteservice.save(this.formCliente.value).subscribe({
        next: (resp) => {
          console.log('Cliente guardado exitosamente');
          this.closeModal();
          alert('Cliente guardado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 400);
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert('Error al guardar el cliente');
        }
      });
    } else {
      alert('Por favor complete todos los campos requeridos');
      this.markFormGroupTouched(this.formCliente);
    }
  }

  update() {
    if (this.formCliente.valid) {
      console.log('Actualizando cliente...');
      
      this.clienteservice.update(this.formCliente.value).subscribe({
        next: (resp) => {
          console.log('Cliente actualizado exitosamente');
          this.closeModal();
          alert('Cliente actualizado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 400);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el cliente');
        }
      });
    } else {
      alert('Por favor complete todos los campos requeridos');
      this.markFormGroupTouched(this.formCliente);
    }
  }

  delete(id: number) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.clienteservice.delete(id).subscribe({
        next: (resp) => {
          console.log('Cliente eliminado');
          alert('Cliente eliminado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 200);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar el cliente');
        }
      });
    }
  }

  verDetalles(item: any) {
    const detalles = `
Detalles del Cliente
=====================
ID: ${item.id}
Nombre Completo: ${item.nombre} ${item.apellido_pa} ${item.apellido_ma}
DNI: ${item.dni}
Teléfono: ${item.telefono}
Estado: ${item.estado ? 'Activo' : 'Inactivo'}
    `;
    alert(detalles);
  }

  closeModal() {
    if (!this.isBrowser) return;

    const modalElement = document.getElementById('clienteModal');
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

  getClientesActivos(): number {
    return this.listCliente.filter(c => c.estado === true).length;
  }

  getClientesInactivos(): number {
    return this.listCliente.filter(c => c.estado === false).length;
  }
}