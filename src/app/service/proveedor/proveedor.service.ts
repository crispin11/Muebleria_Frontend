import { Injectable } from '@angular/core';
import { ProveedorModel } from '../../model/proveedor-model';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProveedorService {
  private baseUrl =
    'https://muebleriaapis-production.up.railway.app/api/proveedor';

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<ProveedorModel[]> {
    return this.httpClient
      .get<ProveedorModel[]>(`${this.baseUrl}/ver`)
      .pipe(map((res) => res));
  }

  getById(id: number): Observable<ProveedorModel> {
    return this.httpClient.get<ProveedorModel>(
      `${this.baseUrl}/buscarid/${id}`
    );
  }

  save(request: any): Observable<any> {
    return this.httpClient
      .post<any>(`${this.baseUrl}/agregar`, request)
      .pipe(map((res) => res));
  }

  update(request: any): Observable<any> {
    return this.httpClient
      .post<any>(`${this.baseUrl}/modificar`, request)
      .pipe(map((res) => res));
  }

  delete(id: number): Observable<any> {
    return this.httpClient
      .get<any>(`${this.baseUrl}/eliminar/${id}`)
      .pipe(map((res) => res));
  }
}
