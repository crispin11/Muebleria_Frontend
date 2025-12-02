import { Component, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from '../../service/producto/producto.service';
import { MaterialService } from '../../service/material/material.service';
import { TipoProductoService } from '../../service/tipo_producto/tipo-producto.service';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})  
export class ProductoComponent implements OnInit, AfterViewInit, OnDestroy {
  
  listProducto: any[] = [];
  listTipoProducto: any[] = [];
  listMaterial: any[] = [];
  formProducto!: FormGroup;
  isUpdate: boolean = false;
  private dataTable: any = null;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private productoservice: ProductoService,
    private tipoProductoService: TipoProductoService,
    private materialService: MaterialService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initForm();
  }

  ngOnInit() {
    this.cargarCatalogos();
    this.list();
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.destroyDataTable();
  }

  initForm() {
    this.formProducto = this.fb.group({
      id: [0],
      nombre: ['', Validators.required],
      tipoProductoId: [null, Validators.required],
      materialId: [null, Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      medidas: [''],
      descripcion: [''],
      estado: [true]
    });
  }

  cargarCatalogos() {
    this.tipoProductoService.getAll().subscribe({
      next: (tipos) => {
        this.listTipoProducto = tipos.filter((t: any) => t.estado);
        console.log('Tipos de producto cargados:', this.listTipoProducto.length);
      },
      error: (err) => {
        console.error('Error al cargar tipos de producto:', err);
      }
    });

    this.materialService.getAll().subscribe({
      next: (materiales) => {
        this.listMaterial = materiales.filter((m: any) => m.estado);
        console.log('Materiales cargados:', this.listMaterial.length);
      },
      error: (err) => {
        console.error('Error al cargar materiales:', err);
      }
    });
  }

  private formToBackendFormat(): any {
    const formValue = this.formProducto.value;
    
    return {
      id: formValue.id || 0,
      nombre: formValue.nombre,
      tipoProducto: { id: formValue.tipoProductoId },
      material: { id: formValue.materialId },
      cantidad: formValue.cantidad,
      precio: formValue.precio,
      medidas: formValue.medidas,
      descripcion: formValue.descripcion,
      estado: formValue.estado
    };
  }

  destroyDataTable() {
    if (!this.isBrowser) return;

    try {
      console.log('Destruyendo DataTable...');
      
      if (this.dataTable) {
        this.dataTable.destroy();
        this.dataTable = null;
        console.log('DataTable destruido correctamente');
      } else if ($.fn.DataTable && $.fn.DataTable.isDataTable('#productosTable')) {
        $('#productosTable').DataTable().destroy();
        console.log('DataTable destruido via jQuery');
      }

    } catch (error) {
      console.warn('Error al destruir DataTable:', error);
    }
  }

  initDataTable() {
    if (!this.isBrowser) return;

    const tableSelector = '#productosTable';

    if ($.fn.DataTable.isDataTable(tableSelector)) {
      console.log('DataTable existe, actualizando datos...');
      this.dataTable.clear();
      this.dataTable.rows.add(this.listProducto);
      this.dataTable.draw();
      return;
    }

    console.log('Inicializando DataTable por primera vez con', this.listProducto.length, 'productos');
    
    this.dataTable = $(tableSelector).DataTable({
      data: this.listProducto,
      columns: [
        { data: 'id', title: 'ID' },
        { data: 'nombre', title: 'NOMBRE' },
        { data: 'tipoProducto', title: 'TIPO' },
        { data: 'material', title: 'MATERIAL' },
        { 
          data: 'cantidad', 
          title: 'CANTIDAD',
          className: 'text-center'
        },
        { 
          data: 'precio', 
          title: 'PRECIO',
          render: (data: any) => `S/. ${data}`
        },
        { data: 'medidas', title: 'MEDIDAS' },
        { data: 'descripcion', title: 'DESCRIPCIÓN' },
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
        const table = $('#productosTable');

        table.on('click', '.btn-ver', (event: any) => {
          const id = $(event.currentTarget).data('id');
          const producto = this.listProducto.find(p => p.id === id);
          if (producto) {
            this.verDetalles(producto);
          }
        });

        table.on('click', '.btn-editar', (event: any) => {
          const id = $(event.currentTarget).data('id');
          const producto = this.listProducto.find(p => p.id === id);
          if (producto) {
            this.selectItem(producto);
            const modal = new bootstrap.Modal(document.getElementById('productoModal'));
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
    
    this.productoservice.getAll().subscribe({
      next: (resp) => {
        if (resp) {
          this.listProducto = resp;
          console.log('Datos actualizados:', this.listProducto.length, 'productos');
          
          this.cdr.detectChanges();

          if (this.dataTable) {
            console.log('Actualizando DataTable existente');
            this.dataTable.clear();
            this.dataTable.rows.add(this.listProducto);
            this.dataTable.draw();
          } else {
            console.log('Inicializando nuevo DataTable');
            setTimeout(() => this.initDataTable(), 300);
          }
        }
      },
      error: (err) => {
        console.error('Error al recargar productos:', err);
        alert('Error al recargar productos');
      }
    });
  }

  list() {
    console.log('Cargando lista inicial de productos...');
    
    this.productoservice.getAll().subscribe({
      next: (resp) => {
        if (resp) {
          this.listProducto = resp;
          console.log('Productos cargados:', this.listProducto.length);
          
          this.cdr.detectChanges();

          if (!this.dataTable && this.isBrowser) {
            setTimeout(() => {
              this.initDataTable();
            }, 300);
          } else if (this.dataTable) {
            this.dataTable.clear();
            this.dataTable.rows.add(this.listProducto);
            this.dataTable.draw();
          }
        }
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
        alert('Error al cargar productos');
      }
    });
  }

  newRol() {
    this.isUpdate = false;
    this.formProducto.reset({
      id: 0,
      estado: true,
      cantidad: 0,
      precio: 0,
      tipoProductoId: null,
      materialId: null
    });
  }

  selectItem(item: any) {
    this.isUpdate = true;
    
    const tipoProducto = this.listTipoProducto.find(t => t.nombre === item.tipoProducto);
    const material = this.listMaterial.find(m => m.nombre === item.material);
    
    this.formProducto.patchValue({
      id: item.id,
      nombre: item.nombre,
      tipoProductoId: tipoProducto?.id,
      materialId: material?.id,
      cantidad: item.cantidad,
      precio: item.precio,
      medidas: item.medidas,
      descripcion: item.descripcion,
      estado: item.estado
    });
  }

  save() {
    if (this.formProducto.valid) {
      console.log('Guardando producto...');
      
      const productoData = this.formToBackendFormat();
      
      this.productoservice.save(productoData).subscribe({
        next: (resp) => {
          console.log('Producto guardado exitosamente');
          this.closeModal();
          alert('Producto guardado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 400);
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert('Error al guardar el producto');
        }
      });
    } else {
      alert('Por favor complete todos los campos requeridos');
      this.markFormGroupTouched(this.formProducto);
    }
  }

  update() {
    if (this.formProducto.valid) {
      console.log('Actualizando producto...');
      
      const productoData = this.formToBackendFormat();
      
      this.productoservice.update(productoData).subscribe({
        next: (resp) => {
          console.log('Producto actualizado exitosamente');
          this.closeModal();
          alert('Producto actualizado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 400);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el producto');
        }
      });
    } else {
      alert('Por favor complete todos los campos requeridos');
      this.markFormGroupTouched(this.formProducto);
    }
  }

  delete(id: number) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      this.productoservice.delete(id).subscribe({
        next: (resp) => {
          console.log('Producto eliminado');
          alert('Producto eliminado exitosamente');
          
          setTimeout(() => {
            this.recargarTabla();
          }, 200);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar el producto');
        }
      });
    }
  }

  verDetalles(item: any) {
    const detalles = `
      Detalles del Producto
      =====================
      ID: ${item.id}
      Nombre: ${item.nombre}
      Tipo: ${item.tipoProducto}
      Material: ${item.material}
      Cantidad: ${item.cantidad}
      Precio: S/. ${item.precio}
      Medidas: ${item.medidas || 'No especificadas'}
      Descripción: ${item.descripcion || 'Sin descripción'}
      Estado: ${item.estado ? 'Activo' : 'Inactivo'}
          `;
    alert(detalles);
  }

  exportarExcel() {
  }

  closeModal() {
    if (!this.isBrowser) return;

    const modalElement = document.getElementById('productoModal');
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

  getProductosActivos(): number {
    return this.listProducto.filter(p => p.estado === true).length;
  }

  getProductosInactivos(): number {
    return this.listProducto.filter(p => p.estado === false).length;
  }

  getStockBajo(): number {
    return this.listProducto.filter(p => p.cantidad < 10).length;
  }
}