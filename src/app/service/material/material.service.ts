import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MaterialModel } from '../../model/material-model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private baseUrl =
    'https://muebleriaapis-production.up.railway.app/api/material';

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<MaterialModel[]> {
    return this.httpClient
      .get<MaterialModel[]>(`${this.baseUrl}/ver`)
      .pipe(map((res) => res));
  }

  getById(id: number): Observable<MaterialModel> {
    return this.httpClient.get<MaterialModel>(`${this.baseUrl}/buscarid/${id}`);
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
