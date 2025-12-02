import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UsuarioModel } from '../../model/usuario-model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private httpClient:HttpClient) { }
  
  getUsuario():Observable<UsuarioModel[]>{
    return this.httpClient.get<UsuarioModel[]>('http://localhost:8080/api/usuario'+'/ver').pipe(map(res=>res))
  }
  getUsuarioById(id: number): Observable<UsuarioModel> {
    return this.httpClient.get<UsuarioModel>('http://localhost:8080/api/usuario'+`/buscarid/${id}`);
  }
  saveUsuario(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/usuario'+'/agregar',request).pipe(map(res=>res))
  }
  updateUsuario(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/usuario'+'/modificar',request).pipe(map(res=>res))
  }
  deleteUsuario(id:number):Observable<any>{
    return this.httpClient.get<any>('http://localhost:8080/api/usuario'+`/eliminar/${id}`).pipe(map(res=>res))
  }
}
