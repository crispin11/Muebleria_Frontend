import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { tipoproductoModel } from '../../model/tipo-producto-model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TipoProductoService {

  constructor(private httpClient:HttpClient) { }
  
  getAll():Observable<tipoproductoModel[]>{
    return this.httpClient.get<tipoproductoModel[]>('http://localhost:8080/api/tipoproducto'+'/ver').pipe(map(res=>res))
  }
  getById(id: number): Observable<tipoproductoModel> {
    return this.httpClient.get<tipoproductoModel>('http://localhost:8080/api/tipoproducto'+`/buscarid/${id}`);
  }
  save(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/tipoproducto'+'/agregar',request).pipe(map(res=>res))
  }
  update(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/tipoproducto'+'/modificar',request).pipe(map(res=>res))
  }
  delete(id:number):Observable<any>{
    return this.httpClient.get<any>('http://localhost:8080/api/tipoproducto'+`/eliminar/${id}`).pipe(map(res=>res))
  }
}
