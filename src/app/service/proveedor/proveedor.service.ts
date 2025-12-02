import { Injectable } from '@angular/core';
import { ProveedorModel } from '../../model/proveedor-model';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  constructor(private httpClient:HttpClient) { }
  
  getAll():Observable<ProveedorModel[]>{
    return this.httpClient.get<ProveedorModel[]>('http://localhost:8080/api/proveedor'+'/ver').pipe(map(res=>res))
  }
  getById(id: number): Observable<ProveedorModel> {
    return this.httpClient.get<ProveedorModel>('http://localhost:8080/api/proveedor'+`/buscarid/${id}`);
  }
  save(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/proveedor'+'/agregar',request).pipe(map(res=>res))
  }
  update(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/proveedor'+'/modificar',request).pipe(map(res=>res))
  }
  delete(id:number):Observable<any>{
    return this.httpClient.get<any>('http://localhost:8080/api/proveedor'+`/eliminar/${id}`).pipe(map(res=>res))
  }
}
