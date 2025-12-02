import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KardexModel } from '../../model/kardex-model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KardexService {
  private baseUrl = 'https://muebleriaapis-production.up.railway.app/api/venta';

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<KardexModel[]> {
    return this.httpClient
      .get<KardexModel[]>(`${this.baseUrl}/kardex`)
      .pipe(map((res) => res));
  }
}
