// src/app/sensores/sensores.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sensor } from './models/sensor.model';

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

// ** NUEVO **
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
  private base = 'http://localhost:5000/api/sensores';

  constructor(private http: HttpClient) { }

  getSensoresPage(
    page: number,
    pageSize: number,
    filters: SensorFilters = {}
  ): Observable<PagedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    Object.entries(filters).forEach(([k, v]) => {
      if (v != null && v !== '') params = params.set(k, v.toString());
    });

    return this.http.get<PagedResponse>(this.base, { params });
      
  /** Ahora sí devuelve un Observable */
  getSensoresPorFiltro(invernaderoId: number, tipoParametroId: number): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(`${this.base}/sensores/filtro`,
      {
        params: {
          invernadero_id: invernaderoId,
          tipo_parametro_id: tipoParametroId
        }
      }
    );
  }

  crearSensor(payload: CrearSensorPayload): Observable<CrearSensorResponse> {
    return this.http.post<CrearSensorResponse>(this.base, payload);
  }

  editarSensor(payload: EditarSensorPayload): Observable<Sensor> {
    // Hacemos PUT /api/sensores/:id
    return this.http.put<Sensor>(
      `${this.base}/${payload.id}`,
      payload
    );
  }

  eliminarSensor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** PARA ALERTAS: filtrar por invernadero y tipo parámetro */
  getSensoresPorFiltro(invId: number, tipoParamId: number): Observable<Sensor[]> {
    let params = new HttpParams()
      .set('invernaderoId', invId.toString())
      .set('tipoParametroId', tipoParamId.toString());
    return this.http.get<Sensor[]>(this.base, { params });
  }
}