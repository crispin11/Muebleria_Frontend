import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MaterialModel } from '../../model/material-model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  constructor(private httpClient:HttpClient) { }
  
  getAll():Observable<MaterialModel[]>{
    return this.httpClient.get<MaterialModel[]>('http://localhost:8080/api/material'+'/ver').pipe(map(res=>res))
  }
  getById(id: number): Observable<MaterialModel> {
    return this.httpClient.get<MaterialModel>('http://localhost:8080/api/material'+`/buscarid/${id}`);
  }
  save(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/material'+'/agregar',request).pipe(map(res=>res))
  }
  update(request:any):Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/material'+'/modificar',request).pipe(map(res=>res))
  }
  delete(id:number):Observable<any>{
    return this.httpClient.get<any>('http://localhost:8080/api/material'+`/eliminar/${id}`).pipe(map(res=>res))
  }
}
