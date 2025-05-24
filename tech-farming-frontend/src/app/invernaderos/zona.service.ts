// src/app/invernaderos/zona.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Zona } from './models/invernadero.model';

@Injectable({
  providedIn: 'root'
})
export class ZonaService {
  private baseUrl = 'http://localhost:5000/api/invernaderos';

  constructor(private http: HttpClient) {}

  /**
   * Devuelve las zonas asociadas a un invernadero.
   * GET /api/invernaderos/:id/zonas
   */
  getZonasByInvernadero(invernaderoId: number): Observable<Zona[]> {
    return this.http.get<Zona[]>(
      `${this.baseUrl}/${invernaderoId}/zonas`
    );
  }
}
