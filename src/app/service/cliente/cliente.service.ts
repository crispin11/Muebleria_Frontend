import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, timeout } from 'rxjs';
import { ClienteModel } from '../../model/cliente-model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  constructor(private httpClient:HttpClient) { }
  
  getAll():Observable<ClienteModel[]>{
    return this.httpClient.get<ClienteModel[]>('http://localhost:8080/api/cliente'+'/ver').pipe(map(res=>res, timeout(100000)))
  }
  getById(id: number): Observable<ClienteModel> {
    return this.httpClient.get<ClienteModel>('http://localhost:8080/api/cliente'+`/buscarid/${id}`);
  }
  save(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/cliente'+'/agregar',request).pipe(map(res=>res))
  }
  update(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/cliente'+'/modificar',request).pipe(map(res=>res))
  }
  delete(id:number):Observable<any>{
    return this.httpClient.get<any>('http://localhost:8080/api/cliente'+`/eliminar/${id}`).pipe(map(res=>res))
  }
}
