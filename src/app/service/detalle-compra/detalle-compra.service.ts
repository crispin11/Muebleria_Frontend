import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DetallecompraModel } from '../../model/detalle-compra-model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetalleCompraService {
  constructor(private httpClient:HttpClient) { }
  
  get():Observable<DetallecompraModel[]>{
    return this.httpClient.get<DetallecompraModel[]>('http://localhost:8080/api/detallecompra'+'/ver').pipe(map(res=>res))
  }
  getById(id: number): Observable<DetallecompraModel> {
    return this.httpClient.get<DetallecompraModel>('http://localhost:8080/api/detallecompra'+`/buscarid/${id}`);
  }
  save(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/detallecompra'+'/agregar',request).pipe(map(res=>res))
  }
}
