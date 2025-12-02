import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VentaModel } from '../../model/venta-model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  constructor(private httpClient:HttpClient) { }
  
  getUsuario():Observable<VentaModel[]>{
    return this.httpClient.get<VentaModel[]>('http://localhost:8080/api/venta'+'/ver').pipe(map(res=>res))
  }
  getUsuarioById(id: number): Observable<VentaModel> {
    return this.httpClient.get<VentaModel>('http://localhost:8080/api/venta'+`/buscarid/${id}`);
  }
  saveUsuario(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/venta'+'/agregar',request).pipe(map(res=>res))
  }
}
