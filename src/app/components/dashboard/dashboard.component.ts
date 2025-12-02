import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CompraService } from '../../service/compra/compra.service';
import { ProductoService } from '../../service/producto/producto.service';
import { ProveedorService } from '../../service/proveedor/proveedor.service';
import { VentaService } from '../../service/venta/venta.service';
import { ClienteService } from '../../service/cliente/cliente.service';
import { NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';

// Interfaces
interface CompraDto {
  id: number;
  proveedor: string;
  fecha: string;
  total: number;
  estado: boolean;
}

interface VentaDto {
  id: number;
  cliente: any;
  usuario: any;
  metodoPago: any;
  fecha: string;
  total: number;
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

interface ProveedorModel {
  id: number;
  razon_social: string;
  ruc: string;
  direccion: string;
  telefono: string;
  estado: boolean;
}

interface ClienteModel {
  id: number;
  nombre: string;
  apellido_pa: string;
  apellido_ma: string;
  dni: string;
  telefono: string;
  estado: boolean;
}

interface ReporteComprasPorProveedor {
  proveedor: string;
  totalCompras: number;
  montoTotal: number;
}

interface ReporteVentasPorCliente {
  cliente: string;
  totalVentas: number;
  montoTotal: number;
}

interface ReporteComprasPorMes {
  mes: string;
  totalCompras: number;
  montoTotal: number;
}

interface ReporteVentasPorMes {
  mes: string;
  totalVentas: number;
  montoTotal: number;
}

interface ProductoStockBajo {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgFor,
    NgIf,
    FormsModule,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  // Datos base
  listCompras: CompraDto[] = [];
  listVentas: VentaDto[] = [];
  listProductos: ProductoModel[] = [];
  listProveedores: ProveedorModel[] = [];
  listClientes: ClienteModel[] = [];

  // Formulario de filtros
  formFiltros: FormGroup = new FormGroup({});

  // Tipo de reporte seleccionado
  tipoReporte: string = 'compras-fecha';

  // Datos de reportes de compras
  comprasFiltradas: CompraDto[] = [];
  reporteProveedores: ReporteComprasPorProveedor[] = [];
  reporteMensualCompras: ReporteComprasPorMes[] = [];

  // Datos de reportes de ventas
  ventasFiltradas: VentaDto[] = [];
  reporteClientes: ReporteVentasPorCliente[] = [];
  reporteMensualVentas: ReporteVentasPorMes[] = [];

  // Datos de productos
  productosStockBajo: ProductoStockBajo[] = [];

  // Totales de compras
  totalCompras: number = 0;
  totalMontoCompras: number = 0;

  // Totales de ventas
  totalVentas: number = 0;
  totalMontoVentas: number = 0;

  // Totales de inventario
  totalProductos: number = 0;
  valorInventario: number = 0;

  // Control de stock mínimo
  stockMinimo: number = 10;

  constructor(
    private compraServi: CompraService,
    private ventaServi: VentaService,
    private productoServi: ProductoService,
    private proveedorServi: ProveedorService,
    private clienteServi: ClienteService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarDatos();
  }

  initForm(): void {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    this.formFiltros = new FormGroup({
      fechaInicio: new FormControl(this.formatDate(primerDiaMes)),
      fechaFin: new FormControl(this.formatDate(hoy)),
      proveedor: new FormControl('todos'),
      cliente: new FormControl('todos'),
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  cargarDatos(): void {
    this.cargarCompras();
    this.cargarVentas();
    this.cargarProductos();
    this.cargarProveedores();
    this.cargarClientes();
  }

  cargarCompras(): void {
    this.compraServi.getCompras().subscribe({
      next: (resp) => {
        this.listCompras = resp.filter((c) => c.estado);
        this.generarReporte();
      },
      error: (err) => {
        console.error('Error al cargar compras:', err);
      },
    });
  }

  cargarVentas(): void {
    this.ventaServi.getUsuario().subscribe({
      next: (resp) => {
        this.listVentas = resp.filter((v) => v.estado);
        this.generarReporte();
      },
      error: (err) => {
        console.error('Error al cargar ventas:', err);
      },
    });
  }

  cargarProductos(): void {
    this.productoServi.getAll().subscribe({
      next: (resp) => {
        this.listProductos = resp.filter((p) => p.estado);
        this.calcularEstadisticasInventario();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      },
    });
  }

  cargarProveedores(): void {
    this.proveedorServi.getAll().subscribe({
      next: (resp) => {
        this.listProveedores = resp.filter((p) => p.estado);
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
      },
    });
  }

  cargarClientes(): void {
    this.clienteServi.getAll().subscribe({
      next: (resp) => {
        this.listClientes = resp.filter((c) => c.estado);
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
      },
    });
  }

  cambiarTipoReporte(tipo: string): void {
    this.tipoReporte = tipo;
    this.generarReporte();
  }

  generarReporte(): void {
    switch (this.tipoReporte) {
      case 'compras-fecha':
        this.generarReporteComprasPorFecha();
        break;
      case 'compras-proveedor':
        this.generarReporteComprasPorProveedor();
        break;
      case 'compras-mensual':
        this.generarReporteComprasMensual();
        break;
      case 'ventas-fecha':
        this.generarReporteVentasPorFecha();
        break;
      case 'ventas-cliente':
        this.generarReporteVentasPorCliente();
        break;
      case 'ventas-mensual':
        this.generarReporteVentasMensual();
        break;
      case 'inventario':
        this.generarReporteInventario();
        break;
      case 'stock-bajo':
        this.generarReporteStockBajo();
        break;
    }
  }

  // ========== REPORTES DE COMPRAS ==========

  generarReporteComprasPorFecha(): void {
    const fechaInicio = new Date(this.formFiltros.get('fechaInicio')?.value);
    const fechaFin = new Date(this.formFiltros.get('fechaFin')?.value);
    const proveedorFiltro = this.formFiltros.get('proveedor')?.value;

    fechaFin.setHours(23, 59, 59, 999);

    this.comprasFiltradas = this.listCompras.filter((compra) => {
      const fechaCompra = new Date(compra.fecha);
      const cumpleFecha = fechaCompra >= fechaInicio && fechaCompra <= fechaFin;
      const cumpleProveedor =
        proveedorFiltro === 'todos' || compra.proveedor === proveedorFiltro;

      return cumpleFecha && cumpleProveedor;
    });

    this.totalCompras = this.comprasFiltradas.length;
    this.totalMontoCompras = this.comprasFiltradas.reduce(
      (sum, c) => sum + c.total,
      0
    );
  }

  generarReporteComprasPorProveedor(): void {
    const proveedoresMap = new Map<
      string,
      { totalCompras: number; montoTotal: number }
    >();

    this.listCompras.forEach((compra) => {
      if (!proveedoresMap.has(compra.proveedor)) {
        proveedoresMap.set(compra.proveedor, {
          totalCompras: 0,
          montoTotal: 0,
        });
      }

      const datos = proveedoresMap.get(compra.proveedor)!;
      datos.totalCompras++;
      datos.montoTotal += compra.total;
    });

    this.reporteProveedores = Array.from(proveedoresMap.entries())
      .map(([proveedor, datos]) => ({
        proveedor,
        totalCompras: datos.totalCompras,
        montoTotal: datos.montoTotal,
      }))
      .sort((a, b) => b.montoTotal - a.montoTotal);
  }

  generarReporteComprasMensual(): void {
    const mesesMap = new Map<
      string,
      { totalCompras: number; montoTotal: number }
    >();
    const meses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    this.listCompras.forEach((compra) => {
      const fecha = new Date(compra.fecha);
      const mesAnio = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;

      if (!mesesMap.has(mesAnio)) {
        mesesMap.set(mesAnio, { totalCompras: 0, montoTotal: 0 });
      }

      const datos = mesesMap.get(mesAnio)!;
      datos.totalCompras++;
      datos.montoTotal += compra.total;
    });

    this.reporteMensualCompras = Array.from(mesesMap.entries()).map(
      ([mes, datos]) => ({
        mes,
        totalCompras: datos.totalCompras,
        montoTotal: datos.montoTotal,
      })
    );
  }

  // ========== REPORTES DE VENTAS ==========

  obtenerNombreCliente(clienteObj: any): string {
    if (!clienteObj) return 'Cliente desconocido';

    // Si es un objeto con id
    if (typeof clienteObj === 'object' && clienteObj.id) {
      const cliente = this.listClientes.find((c) => c.id === clienteObj.id);
      if (cliente) {
        return `${cliente.nombre} ${cliente.apellido_pa || ''} ${
          cliente.apellido_ma || ''
        }`.trim();
      }
    }

    // Si es un ID directo
    if (typeof clienteObj === 'number') {
      const cliente = this.listClientes.find((c) => c.id === clienteObj);
      if (cliente) {
        return `${cliente.nombre} ${cliente.apellido_pa || ''} ${
          cliente.apellido_ma || ''
        }`.trim();
      }
    }

    return 'Cliente desconocido';
  }

  generarReporteVentasPorFecha(): void {
    const fechaInicio = new Date(this.formFiltros.get('fechaInicio')?.value);
    const fechaFin = new Date(this.formFiltros.get('fechaFin')?.value);
    const clienteFiltro = this.formFiltros.get('cliente')?.value;

    fechaFin.setHours(23, 59, 59, 999);

    this.ventasFiltradas = this.listVentas.filter((venta) => {
      const fechaVenta = new Date(venta.fecha);
      const cumpleFecha = fechaVenta >= fechaInicio && fechaVenta <= fechaFin;

      let cumpleCliente = true;
      if (clienteFiltro !== 'todos') {
        const clienteId =
          typeof venta.cliente === 'object' ? venta.cliente.id : venta.cliente;
        cumpleCliente = clienteId === Number(clienteFiltro);
      }

      return cumpleFecha && cumpleCliente;
    });

    this.totalVentas = this.ventasFiltradas.length;
    this.totalMontoVentas = this.ventasFiltradas.reduce(
      (sum, v) => sum + v.total,
      0
    );
  }

  generarReporteVentasPorCliente(): void {
    const clientesMap = new Map<
      string,
      { totalVentas: number; montoTotal: number }
    >();

    this.listVentas.forEach((venta) => {
      const nombreCliente = this.obtenerNombreCliente(venta.cliente);

      if (!clientesMap.has(nombreCliente)) {
        clientesMap.set(nombreCliente, {
          totalVentas: 0,
          montoTotal: 0,
        });
      }

      const datos = clientesMap.get(nombreCliente)!;
      datos.totalVentas++;
      datos.montoTotal += venta.total;
    });

    this.reporteClientes = Array.from(clientesMap.entries())
      .map(([cliente, datos]) => ({
        cliente,
        totalVentas: datos.totalVentas,
        montoTotal: datos.montoTotal,
      }))
      .sort((a, b) => b.montoTotal - a.montoTotal);
  }

  generarReporteVentasMensual(): void {
    const mesesMap = new Map<
      string,
      { totalVentas: number; montoTotal: number }
    >();
    const meses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    this.listVentas.forEach((venta) => {
      const fecha = new Date(venta.fecha);
      const mesAnio = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;

      if (!mesesMap.has(mesAnio)) {
        mesesMap.set(mesAnio, { totalVentas: 0, montoTotal: 0 });
      }

      const datos = mesesMap.get(mesAnio)!;
      datos.totalVentas++;
      datos.montoTotal += venta.total;
    });

    this.reporteMensualVentas = Array.from(mesesMap.entries()).map(
      ([mes, datos]) => ({
        mes,
        totalVentas: datos.totalVentas,
        montoTotal: datos.montoTotal,
      })
    );
  }

  // ========== REPORTES DE INVENTARIO ==========

  generarReporteInventario(): void {
    this.calcularEstadisticasInventario();
  }

  generarReporteStockBajo(): void {
    this.productosStockBajo = this.listProductos
      .filter((p) => p.cantidad <= this.stockMinimo)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precio: p.precio,
      }))
      .sort((a, b) => a.cantidad - b.cantidad);
  }

  calcularEstadisticasInventario(): void {
    this.totalProductos = this.listProductos.length;
    this.valorInventario = this.listProductos.reduce(
      (sum, p) => sum + p.precio * p.cantidad,
      0
    );
  }

  // ========== FILTROS Y UTILIDADES ==========

  aplicarFiltros(): void {
    this.generarReporte();
  }

  limpiarFiltros(): void {
    this.initForm();
    this.generarReporte();
  }

  // ========== EXPORTACIÓN ==========

  exportarReporte(): void {
    let contenido = '';
    let nombreArchivo = '';

    switch (this.tipoReporte) {
      case 'compras-fecha':
        contenido = this.generarCSVComprasFecha();
        nombreArchivo = 'reporte-compras-fecha.csv';
        break;
      case 'compras-proveedor':
        contenido = this.generarCSVComprasProveedor();
        nombreArchivo = 'reporte-compras-proveedor.csv';
        break;
      case 'compras-mensual':
        contenido = this.generarCSVComprasMensual();
        nombreArchivo = 'reporte-compras-mensual.csv';
        break;
      case 'ventas-fecha':
        contenido = this.generarCSVVentasFecha();
        nombreArchivo = 'reporte-ventas-fecha.csv';
        break;
      case 'ventas-cliente':
        contenido = this.generarCSVVentasCliente();
        nombreArchivo = 'reporte-ventas-cliente.csv';
        break;
      case 'ventas-mensual':
        contenido = this.generarCSVVentasMensual();
        nombreArchivo = 'reporte-ventas-mensual.csv';
        break;
      case 'stock-bajo':
        contenido = this.generarCSVStockBajo();
        nombreArchivo = 'reporte-stock-bajo.csv';
        break;
      case 'inventario':
        contenido = this.generarCSVInventario();
        nombreArchivo = 'reporte-inventario.csv';
        break;
    }

    this.descargarArchivo(contenido, nombreArchivo);
  }

  generarCSVComprasFecha(): string {
    let csv = 'ID,Proveedor,Fecha,Total\n';
    this.comprasFiltradas.forEach((c) => {
      csv += `${c.id},${c.proveedor},${c.fecha},${c.total}\n`;
    });
    return csv;
  }

  generarCSVComprasProveedor(): string {
    let csv = 'Proveedor,Total Compras,Monto Total\n';
    this.reporteProveedores.forEach((r) => {
      csv += `${r.proveedor},${r.totalCompras},${r.montoTotal}\n`;
    });
    return csv;
  }

  generarCSVComprasMensual(): string {
    let csv = 'Mes,Total Compras,Monto Total\n';
    this.reporteMensualCompras.forEach((r) => {
      csv += `${r.mes},${r.totalCompras},${r.montoTotal}\n`;
    });
    return csv;
  }

  generarCSVVentasFecha(): string {
    let csv = 'ID,Cliente,Fecha,Total\n';
    this.ventasFiltradas.forEach((v) => {
      const nombreCliente = this.obtenerNombreCliente(v.cliente);
      csv += `${v.id},${nombreCliente},${v.fecha},${v.total}\n`;
    });
    return csv;
  }

  generarCSVVentasCliente(): string {
    let csv = 'Cliente,Total Ventas,Monto Total\n';
    this.reporteClientes.forEach((r) => {
      csv += `${r.cliente},${r.totalVentas},${r.montoTotal}\n`;
    });
    return csv;
  }

  generarCSVVentasMensual(): string {
    let csv = 'Mes,Total Ventas,Monto Total\n';
    this.reporteMensualVentas.forEach((r) => {
      csv += `${r.mes},${r.totalVentas},${r.montoTotal}\n`;
    });
    return csv;
  }

  generarCSVStockBajo(): string {
    let csv = 'ID,Producto,Stock Actual,Precio\n';
    this.productosStockBajo.forEach((p) => {
      csv += `${p.id},${p.nombre},${p.cantidad},${p.precio}\n`;
    });
    return csv;
  }

  generarCSVInventario(): string {
    let csv = 'ID,Producto,Stock,Precio Unitario,Valor Total\n';
    this.listProductos.forEach((p) => {
      const valorTotal = p.precio * p.cantidad;
      csv += `${p.id},${p.nombre},${p.cantidad},${p.precio},${valorTotal}\n`;
    });
    return csv;
  }

  descargarArchivo(contenido: string, nombreArchivo: string): void {
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', nombreArchivo);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  imprimirReporte(): void {
    window.print();
  }
}
