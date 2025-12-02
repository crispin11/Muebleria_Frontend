import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UsuarioModel } from '../../model/usuario-model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private baseUrl =
    'https://muebleriaapis-production.up.railway.app/api/usuario';

  constructor(private httpClient: HttpClient) {}

  getUsuario(): Observable<UsuarioModel[]> {
    return this.httpClient
      .get<UsuarioModel[]>(`${this.baseUrl}/ver`)
      .pipe(map((res) => res));
  }

  getUsuarioById(id: number): Observable<UsuarioModel> {
    return this.httpClient.get<UsuarioModel>(`${this.baseUrl}/buscarid/${id}`);
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
