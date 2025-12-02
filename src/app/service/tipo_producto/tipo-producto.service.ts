import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { tipoproductoModel } from '../../model/tipo-producto-model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TipoProductoService {
  private baseUrl =
    'https://muebleriaapis-production.up.railway.app/api/tipoproducto';

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<tipoproductoModel[]> {
    return this.httpClient
      .get<tipoproductoModel[]>(`${this.baseUrl}/ver`)
      .pipe(map((res) => res));
  }

  getById(id: number): Observable<tipoproductoModel> {
    return this.httpClient.get<tipoproductoModel>(
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
