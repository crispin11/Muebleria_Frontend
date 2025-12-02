import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class CompraService {
  private apiUrl = 'https://muebleriaapis-production.up.railway.app/api/compra';

  constructor(private http: HttpClient) {}

  // Obtener todas las compras
  getCompras(): Observable<CompraDto[]> {
    return this.http.get<CompraDto[]>(`${this.apiUrl}/ver`);
  }

  // Obtener compra por ID (solo cabecera)
  getCompraById(id: number): Observable<CompraDto> {
    return this.http.get<CompraDto>(`${this.apiUrl}/buscarid/${id}`);
  }

  // Obtener compra completa con detalles
  getCompraCompleta(id: number): Observable<CompraCompletaResponse> {
    return this.http.get<CompraCompletaResponse>(
      `${this.apiUrl}/completa/${id}`
    );
  }

  // Guardar compra completa (con detalles)
  saveCompraCompleta(
    compra: CompraCompletaRequest
  ): Observable<CompraCompletaResponse> {
    return this.http.post<CompraCompletaResponse>(
      `${this.apiUrl}/agregar`,
      compra
    );
  }
}
