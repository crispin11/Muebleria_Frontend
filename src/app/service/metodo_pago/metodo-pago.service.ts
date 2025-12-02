import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MetodoPagoModel } from '../../model/metodo-pago-model';

@Injectable({
  providedIn: 'root',
})
export class MetodoPagoService {
  private baseUrl =
    'https://muebleriaapis-production.up.railway.app/api/metodopago';

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<MetodoPagoModel[]> {
    return this.httpClient
      .get<MetodoPagoModel[]>(`${this.baseUrl}/ver`)
      .pipe(map((res) => res));
  }

  getById(id: number): Observable<MetodoPagoModel> {
    return this.httpClient.get<MetodoPagoModel>(
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
