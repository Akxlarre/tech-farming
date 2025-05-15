// src/app/historial/historial.service.ts
import { Injectable }                 from '@angular/core';
import { HttpClient, HttpParams }     from '@angular/common/http';
import { Observable }                 from 'rxjs';

import {
  Invernadero,
  Zona,
  Sensor,
  TipoParametro,
  HistorialParams,
  HistorialData
} from '../models';
//import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private readonly API = `${'url.por.defecto'}/v1`; // Cambiar por la URL de la API

  constructor(private http: HttpClient) {}

  /** GET  /invernaderos */
  getInvernaderos(): Observable<Invernadero[]> {
    return this.http.get<Invernadero[]>(`${this.API}/invernaderos`);
  }

  /** GET  /invernaderos/{id}/zonas */
  getZonasByInvernadero(invernaderoId: number): Observable<Zona[]> {
    return this.http.get<Zona[]>(
      `${this.API}/invernaderos/${invernaderoId}/zonas`
    );
  }

  /** GET  /zonas/{id}/sensores */
  getSensoresByZona(zonaId: number): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(
      `${this.API}/zonas/${zonaId}/sensores`
    );
  }

  /** GET  /parametros */
  getTiposParametro(): Observable<TipoParametro[]> {
    return this.http.get<TipoParametro[]>(`${this.API}/parametros`);
  }

  /**
   * GET  /historial
   *
   * Query params:
   *   invernaderoId  (required)
   *   desde          (required, ISO string)
   *   hasta          (required, ISO string)
   *   tipoParametroId(required)
   *   zonaId         (optional)
   *   sensorId       (optional)
   */
  getHistorial(params: HistorialParams): Observable<HistorialData> {
    let qp = new HttpParams()
      .set('invernaderoId',   params.invernaderoId!.toString())
      .set('desde',           params.fechaDesde.toISOString())
      .set('hasta',           params.fechaHasta.toISOString())
      .set('tipoParametroId', params.tipoParametroId.toString());

    if (params.zonaId != null)   qp = qp.set('zonaId',   params.zonaId.toString());
    if (params.sensorId != null) qp = qp.set('sensorId', params.sensorId.toString());

    return this.http.get<HistorialData>(`${this.API}/historial`, { params: qp });
  }
}