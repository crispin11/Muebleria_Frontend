import { Component, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialService } from '../../service/material/material.service';
import { MaterialModel } from '../../model/material-model';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-material',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css']
})
export class MaterialComponent implements OnInit, AfterViewInit, OnDestroy {
  
  listMaterial: MaterialModel[] = [];
  formMaterial!: FormGroup;
  isUpdate: boolean = false;
  private dataTable: any = null;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private materialservice: MaterialService,
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
    this.formMaterial = this.fb.group({
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
      } else if ($.fn.DataTable && $.fn.DataTable.isDataTable('#materialTable')) {
        $('#materialTable').DataTable().destroy();
        console.log('DataTable destruido via jQuery');
      }

    } catch (error) {
      console.warn('Error al destruir DataTable:', error);
    }
  }

  initDataTable() {
    if (!this.isBrowser) return;

    const tableSelector = '#materialTable';

    if ($.fn.DataTable.isDataTable(tableSelector)) {
      console.log('DataTable existe, actualizando datos...');
      this.dataTable.clear();
      this.dataTable.rows.add(this.listMaterial);
      this.dataTable.draw();
      return;
    }

    console.log('Inicializando DataTable por primera vez con', this.listMaterial.length, 'materiales');
    
    this.dataTable = $(tableSelector).DataTable({
      data: this.listMaterial,
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
        const table = $('#materialTable');

        table.on('click', '.btn-editar', (event: any) => {
          const id = $(event.currentTarget).data('id');
          const material = this.listMaterial.find(m => m.id === id);
          if (material) {
            this.selectItem(material);
            const modal = new bootstrap.Modal(document.getElementById('materialModal'));
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
    
    this.materialservice.getAll().subscribe({
      next: (resp) => {
        if (resp) {
          this.listMaterial = resp;
          console.log('Datos actualizados:', this.listMaterial.length, 'materiales');
          
          this.cdr.detectChanges();

          if (this.dataTable) {
            console.log('Actualizando DataTable existente');
            this.dataTable.clear();
            this.dataTable.rows.add(this.listMaterial);
            this.dataTable.draw();
          } else {
            console.log('Inicializando nuevo DataTable');
            setTimeout(() => this.initDataTable(), 300);
          }
        }
      },
      error: (err) => {
        console.error('Error al recargar materiales:', err);
        alert('Error al recargar materiales');
      }
    });
  }

  list() {
    console.log('Cargando lista inicial de materiales...');
    
    this.materialservice.getAll().subscribe({
      next: (resp) => {
        if (resp) {
          this.listMaterial = resp;
          console.log('Materiales cargados:', this.listMaterial.length);
          
          this.cdr.detectChanges();

          if (!this.dataTable && this.isBrowser) {
            setTimeout(() => {
              this.initDataTable();
            }, 300);
          } else if (this.dataTable) {
            this.dataTable.clear();
            this.dataTable.rows.add(this.listMaterial);
            this.dataTable.draw();
          }
        }
      },
      error: (err) => {
        console.error('Error al obtener materiales:', err);
        alert('Error al cargar materiales');
      }
    });
  }

  newRol() {
    this.isUpdate = false;
    this.formMaterial.reset({
      id: 0,
      estado: true
    });
  }

  selectItem(item: any) {
    this.isUpdate = true;
    this.formMaterial.patchValue({
      id: item.id,
      nombre: item.nombre,
      estado: item.estado
    });
  }

  save() {
    if (this.formMaterial.valid) {
      console.log('Guardando material...');
      
      this.materialservice.save(this.formMaterial.value).subscribe({
        next: (resp) => {
          console.log('Material guardado exitosamente');
          this.closeModal();
          alert('Material guardado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 400);
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert('Error al guardar el material');
        }
      });
    } else {
      alert('Por favor complete todos los campos requeridos');
      this.markFormGroupTouched(this.formMaterial);
    }
  }

  update() {
    if (this.formMaterial.valid) {
      console.log('Actualizando material...');
      
      this.materialservice.update(this.formMaterial.value).subscribe({
        next: (resp) => {
          console.log('Material actualizado exitosamente');
          this.closeModal();
          alert('Material actualizado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 400);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el material');
        }
      });
    } else {
      alert('Por favor complete todos los campos requeridos');
      this.markFormGroupTouched(this.formMaterial);
    }
  }

  delete(id: number) {
    if (confirm('¿Está seguro de eliminar este material?')) {
      this.materialservice.delete(id).subscribe({
        next: (resp) => {
          console.log('Material eliminado');
          alert('Material eliminado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 200);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar el material');
        }
      });
    }
  }

  closeModal() {
    if (!this.isBrowser) return;

    const modalElement = document.getElementById('materialModal');
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

  getMaterialesActivos(): number {
    return this.listMaterial.filter(m => m.estado === true).length;
  }

  getMaterialesInactivos(): number {
    return this.listMaterial.filter(m => m.estado === false).length;
  }
}