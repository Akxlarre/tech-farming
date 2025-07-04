// src/app/sensores/sensores.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sensor } from './models/sensor.model';
import { TipoParametro } from '../models';

export interface SensorFilters {
  invernadero?: number;
  zona?: number;
  tipoSensor?: number;
  estado?: string;
  sortBy?: string; // ej. 'nombre' | '-nombre' | 'fecha_instalacion' | '-fecha_instalacion'
  search?: string;
}

interface PagedResponse {
  data: Sensor[];
  total: number;
}

export interface CrearSensorPayload {
  nombre: string;
  descripcion?: string;
  invernadero_id: number;
  tipo_sensor_id: number;
  zona_id?: number;
  parametro_ids: number[];
  estado: 'Activo' | 'Inactivo' | 'Mantenimiento';
}

export interface CrearSensorResponse {
  token: string;
}

export interface EditarSensorPayload {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: 'Activo' | 'Inactivo' | 'Mantenimiento';
  tipo_sensor_id: number;
  invernadero_id: number;
  zona_id?: number;
  parametro_ids: number[];
}

@Injectable({ providedIn: 'root' })
export class SensoresService {
  private base = 'https://tech-farming-production.up.railway.app/api/sensores';

  constructor(private http: HttpClient) { }

  /** Listado paginado de sensores */
  getSensoresPage(
    page: number,
    pageSize: number,
    filters: SensorFilters = {}
  ): Observable<PagedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    Object.entries(filters).forEach(([k, v]) => {
      if (v != null && v !== '') {
        params = params.set(k, v.toString());
      }
    });

    return this.http.get<PagedResponse>(this.base, { params });
  }

  /** Filtrado de sensores por invernadero y tipo de parámetro */
  getSensoresPorFiltro(
    invernaderoId: number,
    tipoParametroId: number
  ): Observable<Sensor[]> {
    const params = new HttpParams()
      .set('invernadero_id', invernaderoId.toString())
      .set('tipo_parametro_id', tipoParametroId.toString());

    return this.http.get<Sensor[]>(
      `${this.base}/filtro`,
      { params }
    );
  }

  getSensoresPorInvernadero(invernaderoId: number): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(`${this.base}/por-invernadero/${invernaderoId}`);
  }

  getParametrosPorSensor(sensorId: number): Observable<TipoParametro[]> {
    return this.http.get<TipoParametro[]>(`${this.base}/${sensorId}/parametros`);
  }

  /** Creación de sensor */
  crearSensor(payload: CrearSensorPayload): Observable<CrearSensorResponse> {
    return this.http.post<CrearSensorResponse>(this.base, payload);
  }

  /** Edición de sensor */
  editarSensor(payload: EditarSensorPayload): Observable<Sensor> {
    return this.http.put<Sensor>(
      `${this.base}/${payload.id}`,
      payload
    );
  }

  /** DELETE /api/sensores/{id} */
  eliminarSensor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** Para alertas: filtro alternativo por invernadero y tipo de parámetro */
  getSensoresParaAlertas(
    invernaderoId: number,
    tipoParametroId: number
  ): Observable<Sensor[]> {
    const params = new HttpParams()
      .set('invernaderoId', invernaderoId.toString())
      .set('tipoParametroId', tipoParametroId.toString());

    return this.http.get<Sensor[]>(this.base, { params });
  }

  getAlertasActivas(ids: number[]): Observable<{ id: number; alerta: boolean }[]> {
    const params = new HttpParams().set('ids', ids.join(','));
    return this.http.get<{ id: number; alerta: boolean }[]>(`${this.base}/alertas`, { params });
  }
}
