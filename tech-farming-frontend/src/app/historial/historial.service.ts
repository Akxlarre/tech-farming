// src/app/historial/historial.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Invernadero,
  Zona,
  Sensor,
  TipoParametro,
  HistorialParams,
  HistorialData
} from '../models';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  // URLs raíz para cada recurso (Opción A)
  private invernaderoUrl   = 'https://tech-farming-production.up.railway.app/api/invernaderos/getInvernaderos';
  private zonaUrl          = 'https://tech-farming-production.up.railway.app/api';
  private parametroUrl     = 'https://tech-farming-production.up.railway.app/api/parametros';
  private historialUrl     = 'https://tech-farming-production.up.railway.app/api/historial';

  constructor(private http: HttpClient) {}

  /** GET  /api/invernaderos/getInvernaderos  → devuelve Invernadero[] */
  getInvernaderos(): Observable<Invernadero[]> {
    return this.http.get<Invernadero[]>(this.invernaderoUrl);
  }

  /** GET  /api/invernaderos/{id}/zonas */
  getZonasByInvernadero(invernaderoId: number): Observable<Zona[]> {
    return this.http.get<Zona[]>(
      `${this.zonaUrl}/invernaderos/${invernaderoId}/zonas`
    );
  }

  /** GET  /api/zonas/{id}/sensores */
  getSensoresByZona(zonaId: number): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(
      `${this.zonaUrl}/zonas/${zonaId}/sensores`
    );
  }

  /** GET  /api/parametros */
  getTiposParametro(): Observable<TipoParametro[]> {
    return this.http.get<TipoParametro[]>(this.parametroUrl);
  }

  /**
   * GET  /api/historial
   *
   * Query params:
   *   invernaderoId    (required)
   *   desde            (required, ISO string)
   *   hasta            (required, ISO string)
   *   tipoParametroId  (required)
   *   zonaId           (optional)
   *   sensorId         (optional)
   */
  getHistorial(params: HistorialParams): Observable<HistorialData> {
    let qp = new HttpParams()
      .set('invernaderoId',   params.invernaderoId!.toString())
      .set('desde',           params.fechaDesde.toISOString())
      .set('hasta',           params.fechaHasta.toISOString())
      .set('tipoParametroId', params.tipoParametroId.toString());

    if (params.zonaId != null) {
      qp = qp.set('zonaId', params.zonaId.toString());
    }
    if (params.sensorId != null) {
      qp = qp.set('sensorId', params.sensorId.toString());
    }

    const urlDebug = `${this.historialUrl}?${qp.toString()}`;
    console.log('[DEBUG] URL Historial:', urlDebug);

    return this.http.get<HistorialData>(this.historialUrl, { params: qp });
  }
}
