import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ProductoModel } from '../../model/producto-model';
import { LoginService } from '../login/login.service';
import { timeout } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private baseUrl =
    'https://muebleriaapis-production.up.railway.app/api/producto';

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<ProductoModel[]> {
    return this.httpClient
      .get<ProductoModel[]>(`${this.baseUrl}/ver`)
      .pipe(map((res) => res, timeout(1000000)));
  }

  getById(id: number): Observable<ProductoModel> {
    return this.httpClient.get<ProductoModel>(`${this.baseUrl}/buscarid/${id}`);
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
