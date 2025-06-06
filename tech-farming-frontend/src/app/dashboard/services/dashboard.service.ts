// src/app/dashboard/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Invernadero, Zona, Sensor } from '../../models';
import { BatchLectura, TimeSeriesService, HistorialResponse } from '../../sensores/time-series.service';
import { AlertService, Alerta } from '../../alertas/alertas.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private tsSvc: TimeSeriesService,
    private alertSvc: AlertService
  ) {}

  /** GET /api/invernaderos/getInvernaderos */
  getInvernaderos(): Observable<Invernadero[]> {
    return this.http.get<Invernadero[]>(`${this.apiUrl}/invernaderos/getInvernaderos`);
  }

  /** GET /api/invernaderos/{id}/zonas */
  getZonas(invernaderoId: number): Observable<Zona[]> {
    return this.http.get<Zona[]>(`${this.apiUrl}/invernaderos/${invernaderoId}/zonas`);
  }

  /** GET /api/zonas/{id}/sensores */
  getSensoresPorZona(zonaId: number): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(`${this.apiUrl}/zonas/${zonaId}/sensores`);
  }

  /** GET /api/sensores?invernadero={id}&pageSize=1000 */
  getSensores(invernaderoId: number): Observable<Sensor[]> {
    const url = `${this.apiUrl}/sensores?invernadero=${invernaderoId}&pageSize=1000`;
    return this.http.get<{ data: Sensor[] }>(url).pipe(
      map((resp) => resp.data)
    );
  }

  /** GET /api/sensores/lecturas?ids=1,2,3 */
  getLecturas(ids: number[]): Observable<BatchLectura[]> {
    const q = ids.join(',');
    return this.http.get<BatchLectura[]>(`${this.apiUrl}/sensores/lecturas?ids=${q}`);
  }

  /** Delegates to TimeSeriesService.getHistorial */
  getHistorial(params: {
    invernaderoId: number;
    zonaId?: number;
    sensorId?: number;
    tipoParametroId: number;
    desde: string;
    hasta: string;
  }): Observable<HistorialResponse> {
    return this.tsSvc.getHistorial(params);
  }

  /** Delegates to AlertService.getAlertas */
  getAlertas(filtros: {
    estado?: 'Activa' | 'Resuelta';
    nivel?: 'Advertencia' | 'Crítico';
    invernadero_id?: number;
    zona_id?: number;
    busqueda?: string;
    page?: number;
    perPage?: number;
  }): Observable<{ data: Alerta[]; pagination: any }> {
    return this.alertSvc.getAlertas(
      filtros.estado,
      filtros.nivel,
      filtros.invernadero_id,
      filtros.zona_id,
      filtros.busqueda,
      filtros.page,
      filtros.perPage
    );
  }

  resolverAlerta(id: number) {
    return this.alertSvc.resolverAlerta(id);
  }
}
