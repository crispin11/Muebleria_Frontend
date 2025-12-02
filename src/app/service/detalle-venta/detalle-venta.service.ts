import { Injectable } from '@angular/core';
import { DetalleVentaModel } from '../../model/detalle-venta-model';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class DetalleVentaService {
  private baseUrl =
    'https://muebleriaapis-production.up.railway.app/api/detalleventa';

  constructor(private httpClient: HttpClient) {}

  get(): Observable<DetalleVentaModel[]> {
    return this.httpClient
      .get<DetalleVentaModel[]>(`${this.baseUrl}/ver`)
      .pipe(map((res) => res));
  }

  getById(id: number): Observable<DetalleVentaModel> {
    return this.httpClient.get<DetalleVentaModel>(
      `${this.baseUrl}/buscarid/${id}`
    );
  }

  save(request: any): Observable<any> {
    return this.httpClient
      .post<any>(`${this.baseUrl}/agregar`, request)
      .pipe(map((res) => res));
  }
}
