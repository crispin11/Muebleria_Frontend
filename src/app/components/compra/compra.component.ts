import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CompraService } from '../../service/compra/compra.service';
import { ProveedorService } from '../../service/proveedor/proveedor.service';
import { ProductoService } from '../../service/producto/producto.service';
import { NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';

// Interfaces
interface CompraDto {
  id: number;
  proveedor: string;
  fecha: string;
  total: number;
  estado: boolean;
}

interface DetalleCompraDto {
  id?: number;
  idCompra?: number;
  producto: string;
  cantidad: number;
  precioCompra: number;
  subtotal: number;
  estado?: boolean;
}

interface CompraCompletaRequest {
  idProveedor: number;
  detalles: DetalleRequest[];
}

interface DetalleRequest {
  idProducto: number;
  cantidad: number;
  precioCompra: number;
}

interface CompraCompletaResponse {
  idCompra: number;
  proveedor: string;
  fecha: string;
  total: number;
  detalles: DetalleCompraDto[];
}

interface ProveedorModel {
  id: number;
  razon_social: string;
  ruc: string;
  direccion: string;
  telefono: string;
  estado: boolean;
}

interface ProductoModel {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  estado: boolean;
}

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgFor,
    NgIf,
    FormsModule,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './compra.component.html',
  styleUrl: './compra.component.css',
})
export class CompraComponent implements OnInit {
  // Listas principales
  listCompra: CompraDto[] = [];
  listProveedores: ProveedorModel[] = [];
  listProductos: ProductoModel[] = [];

  // Formulario de compra
  formCompra: FormGroup = new FormGroup({});

  // Control de vista
  isUpdate: boolean = false;
  compraId: number = 0;

  // Compra seleccionada para ver detalle
  compraSeleccionada: CompraCompletaResponse | null = null;
  detallesCompra: DetalleCompraDto[] = [];

  // Productos de la compra actual
  productosCompra: DetalleCompraDto[] = [];

  // Nuevo detalle temporal
  nuevoDetalle = {
    productoId: null as number | null,
    cantidad: 0,
    precioCompra: 0,
    subtotal: 0,
    producto: '',
  };

  constructor(
    private compraServi: CompraService,
    private proveedorServi: ProveedorService,
    private productoServi: ProductoService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarDatos();
  }

  initForm(): void {
    this.formCompra = new FormGroup({
      id: new FormControl(null),
      proveedor: new FormControl(null, Validators.required),
      estado: new FormControl(true),
    });
  }

  cargarDatos(): void {
    this.cargarProveedores();
    this.cargarProductos();
    // Llamar a list() después de un pequeño delay para asegurar que los datos estén cargados
    setTimeout(() => {
      this.list();
    }, 500);
  }

  list(): void {
    this.compraServi.getCompras().subscribe({
      next: (resp) => {
        console.log('Compras recibidas:', resp);
        if (resp) {
          this.listCompra = resp;
        }
      },
      error: (err) => {
        console.error('Error al cargar compras:', err);
        alert('Error al cargar la lista de compras');
      },
    });
  }

  cargarProveedores(): void {
    this.proveedorServi.getAll().subscribe({
      next: (resp) => {
        console.log('Proveedores recibidos:', resp);
        this.listProveedores = resp.filter((p) => p.estado);
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        alert('Error al cargar proveedores');
      },
    });
  }

  cargarProductos(): void {
    this.productoServi.getAll().subscribe({
      next: (resp) => {
        console.log('Productos recibidos:', resp);
        this.listProductos = resp.filter((p) => p.estado);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        alert('Error al cargar productos');
      },
    });
  }

  // Buscar compra por ID
  buscarCompraPorId(): void {
    if (!this.compraId || this.compraId <= 0) {
      alert('Por favor, ingresa un ID válido.');
      return;
    }

    this.compraServi.getCompraById(this.compraId).subscribe({
      next: (compra: CompraDto) => {
        this.listCompra = [compra];
      },
      error: (err) => {
        console.error('Error al buscar compra:', err);
        alert('No se encontró una compra con el ID ingresado.');
        this.list(); // Volver a cargar todas las compras
      },
    });
  }

  // Nueva compra
  nuevaCompra(): void {
    this.isUpdate = false;
    this.formCompra.reset({ estado: true });
    this.productosCompra = [];
    this.resetNuevoDetalle();
  }

  // Ver detalle de compra
  verDetalleCompra(compra: CompraDto): void {
    this.compraServi.getCompraCompleta(compra.id).subscribe({
      next: (resp) => {
        console.log('Detalle de compra:', resp);
        this.compraSeleccionada = resp;
        this.detallesCompra = resp.detalles || [];
      },
      error: (err) => {
        console.error('Error al cargar detalle:', err);
        alert('Error al cargar el detalle de la compra');
      },
    });
  }

  cerrarDetalle(): void {
    this.compraSeleccionada = null;
    this.detallesCompra = [];
  }

  // Manejo de productos
  onProductoSeleccionado(event: any): void {
    const productoId = parseInt(event.target.value);

    // Verificar que sea un número válido
    if (isNaN(productoId)) {
      this.resetNuevoDetalle();
      return;
    }

    const producto = this.listProductos.find((p) => p.id === productoId);

    if (producto) {
      this.nuevoDetalle.productoId = producto.id; // Guardar el ID
      this.nuevoDetalle.producto = producto.nombre;
      this.nuevoDetalle.precioCompra = producto.precio;
      this.nuevoDetalle.cantidad = 1; // Inicializar cantidad en 1
      this.calcularSubtotal();

      console.log('Producto seleccionado:', producto);
      console.log('Nuevo detalle:', this.nuevoDetalle);
    } else {
      console.log('Producto no encontrado con ID:', productoId);
      this.resetNuevoDetalle();
    }
  }

  calcularSubtotal(): void {
    if (this.nuevoDetalle.cantidad > 0 && this.nuevoDetalle.precioCompra > 0) {
      this.nuevoDetalle.subtotal =
        this.nuevoDetalle.cantidad * this.nuevoDetalle.precioCompra;
    } else {
      this.nuevoDetalle.subtotal = 0;
    }
  }

  // Permitir editar el precio de compra
  onPrecioCompraChange(): void {
    this.calcularSubtotal();
  }

  agregarProducto(): void {
    if (
      !this.nuevoDetalle.productoId ||
      this.nuevoDetalle.cantidad <= 0 ||
      this.nuevoDetalle.precioCompra <= 0
    ) {
      alert('Por favor complete todos los campos del producto correctamente');
      return;
    }

    // Verificar si el producto ya está agregado ANTES de buscar en la lista
    const existe = this.productosCompra.find(
      (p) => p.producto === this.nuevoDetalle.producto
    );

    if (existe) {
      alert('Este producto ya ha sido agregado a la compra');
      return;
    }

    // Agregar el producto con los datos del nuevoDetalle
    this.productosCompra.push({
      producto: this.nuevoDetalle.producto,
      cantidad: this.nuevoDetalle.cantidad,
      precioCompra: this.nuevoDetalle.precioCompra,
      subtotal: this.nuevoDetalle.subtotal,
    });

    console.log('Producto agregado:', this.nuevoDetalle);
    console.log('Lista de productos en compra:', this.productosCompra);

    this.resetNuevoDetalle();
  }

  eliminarProducto(index: number): void {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      this.productosCompra.splice(index, 1);
    }
  }

  resetNuevoDetalle(): void {
    this.nuevoDetalle = {
      productoId: null,
      cantidad: 0,
      precioCompra: 0,
      subtotal: 0,
      producto: '',
    };
  }

  calcularTotalCompra(): number {
    return this.productosCompra.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // Guardar compra completa
  guardarCompra(): void {
    if (this.formCompra.invalid) {
      alert('Por favor complete todos los campos requeridos');
      this.formCompra.markAllAsTouched();
      return;
    }

    if (this.productosCompra.length === 0) {
      alert('Debe agregar al menos un producto a la compra');
      return;
    }

    const proveedorId = this.formCompra.get('proveedor')?.value;

    console.log('Valor del formulario:', this.formCompra.value);
    console.log('Proveedor ID:', proveedorId);

    if (!proveedorId || proveedorId === 'null' || proveedorId === null) {
      alert('Debe seleccionar un proveedor');
      return;
    }

    // Convertir a número para asegurar que sea un ID válido
    const idProveedorNumero = parseInt(proveedorId);

    if (isNaN(idProveedorNumero)) {
      alert('ID de proveedor inválido');
      return;
    }

    // Construir el objeto de compra completa
    const compraCompleta: CompraCompletaRequest = {
      idProveedor: idProveedorNumero,
      detalles: this.productosCompra.map((item) => {
        const producto = this.listProductos.find(
          (p) => p.nombre === item.producto
        );
        if (!producto) {
          throw new Error(`Producto no encontrado: ${item.producto}`);
        }
        return {
          idProducto: producto.id,
          cantidad: item.cantidad,
          precioCompra: item.precioCompra,
        };
      }),
    };

    console.log('Enviando compra:', JSON.stringify(compraCompleta, null, 2));

    this.compraServi.saveCompraCompleta(compraCompleta).subscribe({
      next: (resp) => {
        console.log('Respuesta del servidor:', resp);
        alert('Compra registrada exitosamente');
        this.list();
        this.formCompra.reset();
        this.productosCompra = [];
        this.resetNuevoDetalle();

        // Cerrar modal usando Bootstrap 5
        const modalElement = document.getElementById('nuevaCompraModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(
            modalElement
          );
          if (modal) {
            modal.hide();
          }
        }
      },
      error: (err) => {
        console.error('Error completo:', err);
        console.error('Error al guardar compra:', err.error);
        alert(
          'Error al guardar la compra. Verifique los datos e intente nuevamente.'
        );
      },
    });
  }

  // Obtener nombre de proveedor
  obtenerNombreProveedor(proveedorNombre: string): string {
    return proveedorNombre || 'N/A';
  }

  // Estadísticas
  calcularTotalCompras(): number {
    return this.listCompra.reduce((sum, item) => sum + (item.total || 0), 0);
  }

  comprasHoy(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.listCompra.filter((c) => {
      if (!c.fecha) return false;

      try {
        const fechaCompra = new Date(c.fecha);
        fechaCompra.setHours(0, 0, 0, 0);
        return fechaCompra.getTime() === hoy.getTime();
      } catch (e) {
        return false;
      }
    }).length;
  }

  comprasActivas(): number {
    return this.listCompra.filter((c) => c.estado).length;
  }

  calcularTotalDetalle(): number {
    return this.detallesCompra.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0
    );
  }

  // Obtener nombre de producto por ID
  obtenerNombreProducto(productoId: number): string {
    const producto = this.listProductos.find((p) => p.id === productoId);
    return producto ? producto.nombre : 'N/A';
  }
}
