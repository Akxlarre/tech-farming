import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LecturaSensor } from "./models/lectura-sensor.model";

// src/app/sensores/time-series.service.ts
export interface BatchLectura {
  sensor_id: string;      // viene como string desde el servidor
  parametros: string[];
  valores: number[];
  time: string | null;
}

export interface HistorialPoint {
  time: string;
  value: number;
}

export interface HistorialStats {
  promedio: number;
  minimo: number | null;
  maximo: number | null;
  desviacion: number;
}

export interface HistorialResponse {
  series: Array<{ timestamp: string; value: number }>;
  stats: {
    promedio: number;
    minimo:  { value: number; fecha: string } | null;
    maximo:  { value: number; fecha: string } | null;
    desviacion: number;
  };
}

@Injectable({ providedIn: 'root' })
export class TimeSeriesService {
  private apiUrl = 'http://localhost:5000/api/sensores';
  private apiUrlHistorial = 'http://localhost:5000/api/historial'

  constructor(private http: HttpClient) {}

  /** Antes: individual */
  getUltimaLectura(sensorId: number): Observable<LecturaSensor|null> {
    return this.http.get<LecturaSensor|null>(
      `${this.apiUrl}/${sensorId}/ultima-lectura`
    );
  }

  /** Nuevo: batch de múltiples IDs */
  getBatchLecturas(ids: number[]): Observable<BatchLectura[]> {
    const q = ids.join(',');
    return this.http.get<BatchLectura[]>(
      `${this.apiUrl}/lecturas?ids=${q}`
    );
  }
  
  getHistorial(params: {
    invernaderoId: number;
    zonaId?: number;
    sensorId?: number;
    tipoParametroId: number;
    desde: string;
    hasta: string;
  }): Observable<HistorialResponse> {
    return this.http.get<HistorialResponse>(
      `${this.apiUrlHistorial}`,  
      { params }
    );
  }
}