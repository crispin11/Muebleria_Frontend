import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ProductoModel } from '../../model/producto-model';
import { LoginService } from '../login/login.service';
import { timeout } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private httpClient:HttpClient) { }
  
  getAll():Observable<ProductoModel[]>{

    return this.httpClient.get<ProductoModel[]>('http://localhost:8080/api/producto'+'/ver').pipe(map(res=>res, timeout(1000000)))
  }
  getById(id: number): Observable<ProductoModel> {
    return this.httpClient.get<ProductoModel>('http://localhost:8080/api/producto'+`/buscarid/${id}`);
  }
  save(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/producto'+'/agregar',request).pipe(map(res=>res))
  }
  update(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/producto'+'/modificar',request).pipe(map(res=>res))
  }
  delete(id:number):Observable<any>{
    return this.httpClient.get<any>('http://localhost:8080/api/producto'+`/eliminar/${id}`).pipe(map(res=>res))
  }
}
