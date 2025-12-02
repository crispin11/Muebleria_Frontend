import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DetallecompraModel } from '../../model/detalle-compra-model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DetalleCompraService {
  private baseUrl =
    'https://muebleriaapis-production.up.railway.app/api/detallecompra';

  constructor(private httpClient: HttpClient) {}

  get(): Observable<DetallecompraModel[]> {
    return this.httpClient
      .get<DetallecompraModel[]>(`${this.baseUrl}/ver`)
      .pipe(map((res) => res));
  }

  getById(id: number): Observable<DetallecompraModel> {
    return this.httpClient.get<DetallecompraModel>(
      `${this.baseUrl}/buscarid/${id}`
    );
  }

  save(request: any): Observable<any> {
    return this.httpClient
      .post<any>(`${this.baseUrl}/agregar`, request)
      .pipe(map((res) => res));
  }
}
