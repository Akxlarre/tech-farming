import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Zona } from './models/zona.model';

@Injectable({ providedIn: 'root' })
export class ZonaService {
  private apiUrl = 'http://localhost:5000/api/zonas';

  constructor(private http: HttpClient) {}

  obtenerZonasPorInvernadero(invernaderoId: number): Observable<Zona[]> {
    const params = new HttpParams().set('invernadero_id', invernaderoId.toString());
    return this.http.get<Zona[]>(this.apiUrl, { params });
  }
}
