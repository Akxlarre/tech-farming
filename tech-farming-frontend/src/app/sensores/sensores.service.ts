// src/app/sensores/sensores.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Sensor } from './models/sensor.model';
import { Observable } from 'rxjs';

export interface SensorFilters {
  invernadero?: number;
  zona?:        number;
  tipoSensor?:  number;
  estado?:      string;
  sortBy?:      string; // ej. 'nombre' | '-nombre' | 'fecha_instalacion' | '-fecha_instalacion'
  search?:      string;
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

@Injectable({ providedIn: 'root' })
export class SensoresService {
  private base = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getSensoresPage(
    page: number,
    pageSize: number,
    filters: SensorFilters = {}
  ): Observable<PagedResponse> {
    const params: any = {
      page: page.toString(),
      pageSize: pageSize.toString()
    };
    // añade sólo filtros definidos
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        params[k] = v.toString();
      }
    });
    return this.http.get<PagedResponse>(
      `${this.base}/sensores`,
      { params }
    );
  }

  /** Ahora sí devuelve un Observable */
  getSensoresPorFiltro(invernaderoId: number, tipoParametroId: number): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(`${this.base}?invernaderoId=${invernaderoId}&tipoParametroId=${tipoParametroId}`);
  }

  crearSensor(payload: CrearSensorPayload): Observable<CrearSensorResponse> {
    return this.http.post<CrearSensorResponse>(this.base, payload);
  }
}