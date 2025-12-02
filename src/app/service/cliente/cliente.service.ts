import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, timeout } from 'rxjs';
import { ClienteModel } from '../../model/cliente-model';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private baseUrl =
    'https://muebleriaapis-production.up.railway.app/api/cliente';

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<ClienteModel[]> {
    return this.httpClient
      .get<ClienteModel[]>(`${this.baseUrl}/ver`)
      .pipe(map((res) => res, timeout(100000)));
  }

  getById(id: number): Observable<ClienteModel> {
    return this.httpClient.get<ClienteModel>(`${this.baseUrl}/buscarid/${id}`);
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
