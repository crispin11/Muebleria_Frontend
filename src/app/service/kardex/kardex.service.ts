import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KardexModel } from '../../model/kardex-model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KardexService {

  constructor(private httpClient:HttpClient) { }
  
  getAll():Observable<KardexModel[]>{
    return this.httpClient.get<KardexModel[]>('http://localhost:8080/api/venta'+'/kardex').pipe(map(res=>res))
  }
}
