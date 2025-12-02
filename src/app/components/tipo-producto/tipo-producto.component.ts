import { Component, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoProductoService } from '../../service/tipo_producto/tipo-producto.service';
import { tipoproductoModel } from '../../model/tipo-producto-model';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-tipo-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tipo-producto.component.html',
  styleUrls: ['./tipo-producto.component.css']
})
export class TipoProductoComponent implements OnInit, AfterViewInit, OnDestroy {
  
  listTipo: tipoproductoModel[] = [];
  formTipo!: FormGroup;
  isUpdate: boolean = false;
  private dataTable: any = null;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private tipopservice: TipoProductoService,
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
    this.formTipo = this.fb.group({
      id: [0],
      nombre: ['', Validators.required],
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
      } else if ($.fn.DataTable && $.fn.DataTable.isDataTable('#tipoProductoTable')) {
        $('#tipoProductoTable').DataTable().destroy();
        console.log('DataTable destruido via jQuery');
      }

    } catch (error) {
      console.warn('Error al destruir DataTable:', error);
    }
  }

  initDataTable() {
    if (!this.isBrowser) return;

    const tableSelector = '#tipoProductoTable';

    if ($.fn.DataTable.isDataTable(tableSelector)) {
      console.log('DataTable existe, actualizando datos...');
      this.dataTable.clear();
      this.dataTable.rows.add(this.listTipo);
      this.dataTable.draw();
      return;
    }

    console.log('Inicializando DataTable por primera vez con', this.listTipo.length, 'tipos');
    
    this.dataTable = $(tableSelector).DataTable({
      data: this.listTipo,
      columns: [
        { data: 'id', title: 'ID' },
        { data: 'nombre', title: 'NOMBRE' },
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
        const table = $('#tipoProductoTable');

        table.on('click', '.btn-editar', (event: any) => {
          const id = $(event.currentTarget).data('id');
          const tipo = this.listTipo.find(t => t.id === id);
          if (tipo) {
            this.selectItem(tipo);
            const modal = new bootstrap.Modal(document.getElementById('tipoProductoModal'));
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
    
    this.tipopservice.getAll().subscribe({
      next: (resp) => {
        if (resp) {
          this.listTipo = resp;
          console.log('Datos actualizados:', this.listTipo.length, 'tipos');
          
          this.cdr.detectChanges();

          if (this.dataTable) {
            console.log('Actualizando DataTable existente');
            this.dataTable.clear();
            this.dataTable.rows.add(this.listTipo);
            this.dataTable.draw();
          } else {
            console.log('Inicializando nuevo DataTable');
            setTimeout(() => this.initDataTable(), 300);
          }
        }
      },
      error: (err) => {
        console.error('Error al recargar tipos:', err);
        alert('Error al recargar tipos de producto');
      }
    });
  }

  list() {
    console.log('Cargando lista inicial de tipos...');
    
    this.tipopservice.getAll().subscribe({
      next: (resp) => {
        if (resp) {
          this.listTipo = resp;
          console.log('Tipos cargados:', this.listTipo.length);
          
          this.cdr.detectChanges();

          if (!this.dataTable && this.isBrowser) {
            setTimeout(() => {
              this.initDataTable();
            }, 300);
          } else if (this.dataTable) {
            this.dataTable.clear();
            this.dataTable.rows.add(this.listTipo);
            this.dataTable.draw();
          }
        }
      },
      error: (err) => {
        console.error('Error al obtener tipos:', err);
        alert('Error al cargar tipos de producto');
      }
    });
  }

  newRol() {
    this.isUpdate = false;
    this.formTipo.reset({
      id: 0,
      estado: true
    });
  }

  selectItem(item: any) {
    this.isUpdate = true;
    this.formTipo.patchValue({
      id: item.id,
      nombre: item.nombre,
      estado: item.estado
    });
  }

  save() {
    if (this.formTipo.valid) {
      console.log('Guardando tipo...');
      
      this.tipopservice.save(this.formTipo.value).subscribe({
        next: (resp) => {
          console.log('Tipo guardado exitosamente');
          this.closeModal();
          alert('Tipo de producto guardado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 400);
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert('Error al guardar el tipo de producto');
        }
      });
    } else {
      alert('Por favor complete todos los campos requeridos');
      this.markFormGroupTouched(this.formTipo);
    }
  }

  update() {
    if (this.formTipo.valid) {
      console.log('Actualizando tipo...');
      
      this.tipopservice.update(this.formTipo.value).subscribe({
        next: (resp) => {
          console.log('Tipo actualizado exitosamente');
          this.closeModal();
          alert('Tipo de producto actualizado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 400);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el tipo de producto');
        }
      });
    } else {
      alert('Por favor complete todos los campos requeridos');
      this.markFormGroupTouched(this.formTipo);
    }
  }

  delete(id: number) {
    if (confirm('¿Está seguro de eliminar este tipo de producto?')) {
      this.tipopservice.delete(id).subscribe({
        next: (resp) => {
          console.log('Tipo eliminado');
          alert('Tipo de producto eliminado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 200);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar el tipo de producto');
        }
      });
    }
  }

  closeModal() {
    if (!this.isBrowser) return;

    const modalElement = document.getElementById('tipoProductoModal');
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

  getTiposActivos(): number {
    return this.listTipo.filter(t => t.estado === true).length;
  }

  getTiposInactivos(): number {
    return this.listTipo.filter(t => t.estado === false).length;
  }
}