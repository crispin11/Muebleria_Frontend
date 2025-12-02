import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VentaModel } from '../../model/venta-model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private baseUrl = 'https://muebleriaapis-production.up.railway.app/api/venta';

  constructor(private httpClient: HttpClient) {}

  getUsuario(): Observable<VentaModel[]> {
    return this.httpClient
      .get<VentaModel[]>(`${this.baseUrl}/ver`)
      .pipe(map((res) => res));
  }

  getUsuarioById(id: number): Observable<VentaModel> {
    return this.httpClient.get<VentaModel>(`${this.baseUrl}/buscarid/${id}`);
  }

  saveUsuario(request: any): Observable<any> {
    return this.httpClient
      .post<any>(`${this.baseUrl}/agregar`, request)
      .pipe(map((res) => res));
  }
}
