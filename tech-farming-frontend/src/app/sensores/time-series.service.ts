import { HttpClient } from "@angular/common/http";
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

@Injectable({ providedIn: 'root' })
export class TimeSeriesService {
  private apiUrl = 'http://localhost:5000/api/sensores';

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
}