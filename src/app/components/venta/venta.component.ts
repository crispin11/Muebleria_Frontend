import { NgFor, NgIf, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VentaService } from '../../service/venta/venta.service';
import { VentaModel } from '../../model/venta-model';
import { DetallecompraModel } from '../../model/detalle-compra-model';
import { DetalleCompraService } from '../../service/detalle-compra/detalle-compra.service';
import { ClienteService } from '../../service/cliente/cliente.service';
import { ClienteModel } from '../../model/cliente-model';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { UsuarioModel } from '../../model/usuario-model';
import { MetodoPagoService } from '../../service/metodo_pago/metodo-pago.service';
import { MetodoPagoModel } from '../../model/metodo-pago-model';
import { ProductoService } from '../../service/producto/producto.service';
import { ProductoModel } from '../../model/producto-model';

declare var bootstrap: any;

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf, FormsModule, CommonModule],
  templateUrl: './venta.component.html',
  styleUrl: './venta.component.css',
})
export class VentaComponent implements OnInit {
  listVenta: VentaModel[] = [];
  formVenta: FormGroup = new FormGroup({});
  isUpdate: boolean = false;
  ventaId: number = 0;

  // Listas para los selects
  listClientes: ClienteModel[] = [];
  listUsuarios: UsuarioModel[] = [];
  listMetodosPago: MetodoPagoModel[] = [];
  listProductos: ProductoModel[] = [];

  // Para filtrado de búsqueda
  clientesFiltrados: ClienteModel[] = [];
  usuariosFiltrados: UsuarioModel[] = [];

  // Para manejar detalles
  ventaSeleccionada: VentaModel | null = null;
  detallesVenta: DetallecompraModel[] = [];
  productosVenta: any[] = [];

  // Para agregar nuevo producto
  nuevoDetalle = {
    productoId: null as number | null,
    producto: '',
    cantidad: 1,
    precioCompra: 0,
    subtotal: 0,
  };

  constructor(
    private ventaService: VentaService,
    private detalleService: DetalleCompraService,
    private clienteService: ClienteService,
    private usuarioService: UsuarioService,
    private metodoPagoService: MetodoPagoService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    let cargasCompletadas = 0;
    const totalCargas = 4;

    const verificarCargaCompleta = () => {
      cargasCompletadas++;
      if (cargasCompletadas === totalCargas) {
        this.list();
      }
    };

    this.cargarClientes(verificarCargaCompleta);
    this.cargarUsuarios(verificarCargaCompleta);
    this.cargarMetodosPago(verificarCargaCompleta);
    this.cargarProductos(verificarCargaCompleta);
  }

  initForm() {
    this.formVenta = new FormGroup({
      id: new FormControl(0),
      cliente: new FormControl(null, Validators.required),
      usuario: new FormControl(null, Validators.required),
      metodoPago: new FormControl(null, Validators.required),
      fecha: new FormControl(new Date().toISOString()),
      total: new FormControl(0),
      estado: new FormControl(true),
    });
  }

  cargarClientes(callback?: () => void) {
    this.clienteService.getAll().subscribe({
      next: (clientes) => {
        this.listClientes = clientes;
        this.clientesFiltrados = clientes;
        console.log('Clientes cargados:', this.listClientes.length);
        if (callback) callback();
      },
      error: (err) => {
        if (callback) callback();
      },
    });
  }

  cargarUsuarios(callback?: () => void) {
    this.usuarioService.getUsuario().subscribe({
      next: (usuarios) => {
        this.listUsuarios = usuarios;
        this.usuariosFiltrados = usuarios;
        if (callback) callback();
      },
      error: (err) => {
        if (callback) callback();
      },
    });
  }

  cargarMetodosPago(callback?: () => void) {
    this.metodoPagoService.getAll().subscribe({
      next: (metodos) => {
        this.listMetodosPago = metodos;
        if (callback) callback();
      },
      error: (err) => {
        if (callback) callback();
      },
    });
  }

  cargarProductos(callback?: () => void) {
    this.productoService.getAll().subscribe({
      next: (productos) => {
        this.listProductos = productos.filter(
          (p) => p.estado && p.cantidad > 0
        );
        console.log('Productos cargados:', this.listProductos.length);
        if (callback) callback();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        alert('Error al cargar la lista de productos');
        if (callback) callback();
      },
    });
  }

  filtrarClientes(event: any) {
    const busqueda = event.target.value.toLowerCase();
    this.clientesFiltrados = this.listClientes.filter(
      (cliente) =>
        cliente.nombre?.toLowerCase().includes(busqueda) ||
        cliente.apellido_pa?.toLowerCase().includes(busqueda) ||
        cliente.dni?.toLowerCase().includes(busqueda)
    );
  }

  filtrarUsuarios(event: any) {
    const busqueda = event.target.value.toLowerCase();
    this.usuariosFiltrados = this.listUsuarios.filter(
      (usuario) =>
        usuario.nombre?.toLowerCase().includes(busqueda) ||
        usuario.apellido_pa?.toLowerCase().includes(busqueda) ||
        usuario.correo?.toLowerCase().includes(busqueda)
    );
  }

  obtenerNombreCliente(id: any): string {
    if (!id) return 'N/A';
    const clienteId = Number(id);
    const cliente = this.listClientes.find((c) => c.id === clienteId);
    if (!cliente) {
      return `ID: ${clienteId}`;
    }
    return `${cliente.nombre} ${cliente.apellido_pa || ''} ${
      cliente.apellido_ma || ''
    }`.trim();
  }

  obtenerNombreUsuario(usuario: any): string {
    if (!usuario) return 'N/A';
    const usuarioStr = usuario.toString();
    const usuarioEncontrado = this.listUsuarios.find(
      (u) => u.id === Number(usuarioStr) || u.correo === usuarioStr
    );
    if (!usuarioEncontrado) {
      return `ID: ${usuarioStr}`;
    }
    return `${usuarioEncontrado.nombre} ${
      usuarioEncontrado.apellido_pa || ''
    } ${usuarioEncontrado.apellido_ma || ''}`.trim();
  }

  obtenerNombreMetodoPago(metodoPago: any): string {
    if (!metodoPago) return 'N/A';
    const metodoPagoStr = metodoPago.toString();
    const metodoEncontrado = this.listMetodosPago.find(
      (m) => m.id === Number(metodoPagoStr) || m.nombre === metodoPagoStr
    );
    if (!metodoEncontrado) {
      return `ID: ${metodoPagoStr}`;
    }
    return metodoEncontrado.nombre;
  }

  list() {
    this.ventaService.getUsuario().subscribe({
      next: (resp) => {
        if (resp) {
          this.listVenta = resp;
          console.log('Ventas cargadas:', this.listVenta.length);
        }
      },
      error: (err) => {
        console.error('Error al cargar ventas:', err);
        alert('Error al cargar las ventas');
      },
    });
  }

  nuevaVenta() {
    this.isUpdate = false;
    this.formVenta.reset({
      id: 0,
      cliente: null,
      usuario: null,
      metodoPago: null,
      fecha: new Date().toISOString(),
      total: 0,
      estado: true,
    });
    this.productosVenta = [];
    this.limpiarNuevoDetalle();
    this.clientesFiltrados = this.listClientes;
    this.usuariosFiltrados = this.listUsuarios;
  }

  editarVenta(venta: VentaModel) {
    this.isUpdate = true;
    this.formVenta.patchValue(venta);
    this.cargarDetallesParaEdicion(venta.id);
  }

  cargarDetallesParaEdicion(ventaId: number) {
    this.detalleService.get().subscribe({
      next: (detalles) => {
        this.productosVenta = detalles.filter((d) => d.compra === ventaId);
        console.log(
          'Detalles cargados para edición:',
          this.productosVenta.length
        );
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
      },
    });
  }

  calcularSubtotal() {
    this.nuevoDetalle.subtotal =
      this.nuevoDetalle.cantidad * this.nuevoDetalle.precioCompra;
  }

  onProductoSeleccionado(event: any) {
    const productoId = Number(event.target.value);

    if (!productoId) {
      this.limpiarNuevoDetalle();
      return;
    }

    const producto = this.listProductos.find((p) => p.id === productoId);

    if (producto) {
      this.nuevoDetalle.productoId = producto.id;
      this.nuevoDetalle.producto = producto.nombre;
      this.nuevoDetalle.precioCompra = producto.precio;
      this.nuevoDetalle.cantidad = 1;
      this.calcularSubtotal();

      console.log(
        'Producto seleccionado:',
        producto.nombre,
        '- Precio:',
        producto.precio
      );
    }
  }

  obtenerStockDisponible(productoId: number | null): number {
    if (!productoId) return 0;
    const producto = this.listProductos.find((p) => p.id === productoId);
    return producto ? producto.cantidad : 0;
  }

  agregarProducto() {
    if (
      !this.nuevoDetalle.productoId ||
      !this.nuevoDetalle.producto ||
      this.nuevoDetalle.cantidad <= 0 ||
      this.nuevoDetalle.precioCompra <= 0
    ) {
      alert(
        'Por favor seleccione un producto y complete todos los campos correctamente'
      );
      return;
    }

    const stockDisponible = this.obtenerStockDisponible(
      this.nuevoDetalle.productoId
    );
    if (this.nuevoDetalle.cantidad > stockDisponible) {
      alert(`Stock insuficiente. Disponible: ${stockDisponible} unidades`);
      return;
    }

    this.calcularSubtotal();

    this.productosVenta.push({
      productoId: this.nuevoDetalle.productoId,
      producto: this.nuevoDetalle.producto,
      cantidad: this.nuevoDetalle.cantidad,
      precioCompra: this.nuevoDetalle.precioCompra,
      subtotal: this.nuevoDetalle.subtotal,
    });

    this.limpiarNuevoDetalle();
    console.log(
      'Producto agregado. Total productos:',
      this.productosVenta.length
    );
  }

  eliminarProducto(index: number) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      this.productosVenta.splice(index, 1);
    }
  }

  limpiarNuevoDetalle() {
    this.nuevoDetalle = {
      productoId: null,
      producto: '',
      cantidad: 1,
      precioCompra: 0,
      subtotal: 0,
    };
  }

  calcularTotalVenta(): number {
    return this.productosVenta.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // ===== MÉTODO CORREGIDO: formatearFechaParaAPI =====
  formatearFechaParaAPI(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes (de 1 a 12)
    const day = String(fecha.getDate()).padStart(2, '0'); // Día del mes (1 a 31)
    const hours = String(fecha.getHours()).padStart(2, '0'); // Hora (0 a 23)
    const minutes = String(fecha.getMinutes()).padStart(2, '0'); // Minutos (0 a 59)
    const seconds = String(fecha.getSeconds()).padStart(2, '0'); // Segundos (0 a 59)

    // Retornar la fecha con el formato "yyyy-MM-dd'T'HH:mm:ss"
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  guardarVenta() {
    if (this.formVenta.invalid) {
      alert('Por favor complete todos los campos requeridos');
      Object.keys(this.formVenta.controls).forEach((key) => {
        this.formVenta.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.formVenta.value.cliente) {
      alert('Debe seleccionar un cliente');
      return;
    }
    if (!this.formVenta.value.usuario) {
      alert('Debe seleccionar un usuario');
      return;
    }
    if (!this.formVenta.value.metodoPago) {
      alert('Debe seleccionar un método de pago');
      return;
    }

    if (this.productosVenta.length === 0) {
      alert('Debe agregar al menos un producto a la venta');
      return;
    }

    // Formatear la fecha antes de enviarla
    const fechaActual = new Date();
    const fechaFormateada = this.formatearFechaParaAPI(fechaActual); // Utilizamos el formato correcto

    // Preparar los datos para enviar a la API
    const ventaData = {
      venta: {
        cliente: { id: this.formVenta.value.cliente }, // Cliente con su ID
        usuario: { id: this.formVenta.value.usuario }, // Usuario con su ID
        metodoPago: { id: this.formVenta.value.metodoPago }, // Método de pago con su ID
        fecha: fechaFormateada, // Fecha en el formato correcto
        total: this.calcularTotalVenta(), // Calculamos el total
        estado: true, // Estado de la venta
      },
      detalles: this.productosVenta.map((producto) => ({
        producto: { id: producto.productoId }, // Producto con su ID
        cantidad: producto.cantidad,
        precioUnitario: producto.precioCompra,
        subtotal: producto.subtotal,
        estado: true, // Estado de cada detalle (activo)
      })),
    };

    console.log('=== PASO 1: Guardando venta ===');
    console.log('Datos de venta a enviar:', ventaData);

    // PASO 1: Enviar la venta a la API
    this.ventaService.saveUsuario(ventaData).subscribe({
      next: (ventaGuardada) => {
        console.log('✅ Respuesta de la API:', ventaGuardada);
        alert('Venta guardada exitosamente');

        // Actualizamos la lista de ventas
        this.list();
        this.productosVenta = []; // Limpiamos los productos de la venta
      },
      error: (err) => {
        console.error('❌ Error al guardar venta:', err);
        alert(
          'Error al guardar la venta: ' +
            (err.error?.message || err.message || 'Error desconocido')
        );
      },
    });
  }

  // ===== MÉTODO CORREGIDO: guardarDetalles =====
  guardarDetalles(ventaId: number) {
    let detallesGuardados = 0;
    const totalDetalles = this.productosVenta.length;

    this.productosVenta.forEach((producto, index) => {
      // Formato correcto según tu API de detalleventa
      // Tu API espera: venta (no compra), producto, cantidad, estado
      const detalle = {
        venta: ventaId, // CAMBIO CRÍTICO: era 'compra', ahora es 'venta'
        producto: producto.productoId.toString(), // ID del producto como string
        cantidad: producto.cantidad,
        estado: 1, // Tu API espera 1 (número), no true
      };

      console.log(`Guardando detalle ${index + 1}/${totalDetalles}:`, detalle);

      this.detalleService.save(detalle).subscribe({
        next: (resp) => {
          detallesGuardados++;
          console.log(
            `Detalle ${detallesGuardados}/${totalDetalles} guardado correctamente`
          );

          // Si todos los detalles se guardaron
          if (detallesGuardados === totalDetalles) {
            this.cerrarModal();
            alert('Venta guardada exitosamente con todos sus productos');
            this.list();
            this.productosVenta = [];
          }
        },
        error: (err) => {
          console.error('Error al guardar detalle:', err);
          console.error('Detalle del error:', err.error);
          alert('Error al guardar detalle del producto: ' + producto.producto);
        },
      });
    });
  }

  verDetalleVenta(venta: VentaModel) {
    this.ventaSeleccionada = venta;

    this.detalleService.get().subscribe({
      next: (detalles) => {
        this.detallesVenta = detalles.filter((d) => d.compra === venta.id);
        console.log('Detalles de venta cargados:', this.detallesVenta.length);

        setTimeout(() => {
          const elemento = document.querySelector('.card.mt-4');
          if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
        alert('Error al cargar los detalles de la venta');
      },
    });
  }

  cerrarDetalle() {
    this.ventaSeleccionada = null;
    this.detallesVenta = [];
  }

  calcularTotalDetalle(): number {
    return this.detallesVenta.reduce((sum, item) => sum + item.subtotal, 0);
  }

  eliminarVenta(id: number) {
    if (
      confirm(
        '¿Está seguro de eliminar esta venta? Esta acción no se puede deshacer.'
      )
    ) {
      alert('Función de eliminar no implementada en el servicio');
    }
  }

  buscarVentaPorId() {
    if (!this.ventaId) {
      alert('Por favor, ingresa un ID válido.');
      return;
    }

    this.ventaService.getUsuarioById(this.ventaId).subscribe({
      next: (venta: VentaModel) => {
        this.listVenta = [venta];
        console.log('Venta encontrada:', venta);
      },
      error: (err) => {
        console.error('Error al buscar venta:', err);
        alert('No se encontró una venta con el ID ingresado.');
        this.cargarDatosIniciales();
      },
    });
  }

  cerrarModal() {
    const modalElement = document.getElementById('nuevaVentaModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  calcularTotalVentas(): number {
    return this.listVenta.reduce((sum, venta) => sum + venta.total, 0);
  }

  ventasHoy(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.listVenta.filter((venta) => {
      const fechaVenta = new Date(venta.fecha);
      fechaVenta.setHours(0, 0, 0, 0);
      return fechaVenta.getTime() === hoy.getTime();
    }).length;
  }

  ventasActivas(): number {
    return this.listVenta.filter((v) => v.estado === true).length;
  }
}
