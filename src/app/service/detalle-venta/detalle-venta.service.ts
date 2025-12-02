import { Injectable } from '@angular/core';
import { DetalleVentaModel } from '../../model/detalle-venta-model';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class DetalleVentaService {

  constructor(private httpClient:HttpClient) { }
  
  get():Observable<DetalleVentaModel[]>{
    return this.httpClient.get<DetalleVentaModel[]>('http://localhost:8080/api/detalleventa'+'/ver').pipe(map(res=>res))
  }
  getById(id: number): Observable<DetalleVentaModel> {
    return this.httpClient.get<DetalleVentaModel>('http://localhost:8080/api/detalleventa'+`/buscarid/${id}`);
  }
  save(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/detalleventa'+'/agregar',request).pipe(map(res=>res))
  }
}
