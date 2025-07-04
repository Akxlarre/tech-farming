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
    console.log('[HistorialService] GET', this.invernaderoUrl);
    return this.http.get<Invernadero[]>(this.invernaderoUrl);
  }

  /** GET  /api/invernaderos/{id}/zonas */
  getZonasByInvernadero(invernaderoId: number): Observable<Zona[]> {
    const url = `${this.zonaUrl}/invernaderos/${invernaderoId}/zonas`;
    console.log('[HistorialService] GET', url);
    return this.http.get<Zona[]>(url);
  }

  /** GET  /api/zonas/{id}/sensores */
  getSensoresByZona(zonaId: number): Observable<Sensor[]> {
    const url = `${this.zonaUrl}/zonas/${zonaId}/sensores`;
    console.log('[HistorialService] GET', url);
    return this.http.get<Sensor[]>(url);
  }

  /** GET  /api/parametros */
  getTiposParametro(): Observable<TipoParametro[]> {
    console.log('[HistorialService] GET', this.parametroUrl);
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
