import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MetodoPagoModel } from '../../model/metodo-pago-model';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {

  constructor(private httpClient:HttpClient) { }
  getAll():Observable<MetodoPagoModel[]>{
    return this.httpClient.get<MetodoPagoModel[]>('http://localhost:8080/api/metodopago'+'/ver').pipe(map(res=>res))
  }
  getById(id: number): Observable<MetodoPagoModel> {
    return this.httpClient.get<MetodoPagoModel>('http://localhost:8080/api/metodopago'+`/buscarid/${id}`);
  }
  save(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/metodopago'+'/agregar',request).pipe(map(res=>res))
  }
  update(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/metodopago'+'/modificar',request).pipe(map(res=>res))
  }
  delete(id:number):Observable<any>{
    return this.httpClient.get<any>('http://localhost:8080/api/metodopago'+`/eliminar/${id}`).pipe(map(res=>res))
  }
}
