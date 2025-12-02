import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RoleModel } from '../../model/Role-model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private httpClient:HttpClient) { }
  getUsuario():Observable<RoleModel[]>{
    return this.httpClient.get<RoleModel[]>('http://localhost:8080/api/role'+'/ver').pipe(map(res=>res))
  }
  getRoleById(id: number): Observable<RoleModel> {
    return this.httpClient.get<RoleModel>('http://localhost:8080/api/role'+`/buscarid/${id}`);
  }
  saveUsuario(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/role'+'/agregar',request).pipe(map(res=>res))
  }
  updateUsuario(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/role'+'/modificar',request).pipe(map(res=>res))
  }
  deleteUsuario(id:number):Observable<any>{
    return this.httpClient.get<any>('http://localhost:8080/api/role'+`/eliminar/${id}`).pipe(map(res=>res))
  }
}
