// src/app/predicciones/predicciones.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';

import {
  Invernadero,
  Zona,
  PredicParams,
  PredicResult
} from '../models';

@Injectable({ providedIn: 'root' })
export class PrediccionesService {
  private readonly BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/invernaderos
   * (Supondremos que este endpoint sí devuelve { data: Invernadero[], total: number })
   */
  getInvernaderos(): Observable<Invernadero[]> {
    return this.http
      .get<{ data: Invernadero[]; total: number }>(`${this.BASE_URL}/invernaderos`)
      .pipe(map(response => response.data));
  }

  /**
   * GET /api/invernaderos/{id}/zonas
   * Ya que el backend devuelve directamente Zona[],
   * simplemente pedimos Zona[] sin desempaquetar.
   */
  getZonasByInvernadero(invernaderoId: number): Observable<Zona[]> {
    return this.http.get<Zona[]>(`${this.BASE_URL}/invernaderos/${invernaderoId}/zonas`);
  }

  /**
   * GET /api/predict_influx?invernaderoId=&zonaId=&horas=
   */
  getPredicciones(params: PredicParams): Observable<PredicResult> {
    let httpParams = new HttpParams()
      .set('invernaderoId', params.invernaderoId.toString())
      .set('horas',         params.horas.toString())
      .set('parametro',     params.parametro);

    if (params.zonaId != null) {
      httpParams = httpParams.set('zonaId', params.zonaId.toString());
    }

    return this.http.get<PredicResult>(
      `${this.BASE_URL}/predict_influx`,
      { params: httpParams }
    );
  }
}
