import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {ResumenModel } from '../../model/dashboard-models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private httpClient:HttpClient) { }
  
  getResumen():Observable<ResumenModel[]>{
    return this.httpClient.get<ResumenModel[]>('http://localhost:8080/api/dashboard'+'/resumen').pipe(map(res=>res))
  }
}
