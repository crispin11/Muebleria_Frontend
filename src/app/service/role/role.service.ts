import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RoleModel } from '../../model/Role-model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private baseUrl = 'https://muebleriaapis-production.up.railway.app/api/role';

  constructor(private httpClient: HttpClient) {}

  getUsuario(): Observable<RoleModel[]> {
    return this.httpClient
      .get<RoleModel[]>(`${this.baseUrl}/ver`)
      .pipe(map((res) => res));
  }

  getRoleById(id: number): Observable<RoleModel> {
    return this.httpClient.get<RoleModel>(`${this.baseUrl}/buscarid/${id}`);
  }

  saveUsuario(request: any): Observable<any> {
    return this.httpClient
      .post<any>(`${this.baseUrl}/agregar`, request)
      .pipe(map((res) => res));
  }

  updateUsuario(request: any): Observable<any> {
    return this.httpClient
      .post<any>(`${this.baseUrl}/modificar`, request)
      .pipe(map((res) => res));
  }

  deleteUsuario(id: number): Observable<any> {
    return this.httpClient
      .get<any>(`${this.baseUrl}/eliminar/${id}`)
      .pipe(map((res) => res));
  }
}
