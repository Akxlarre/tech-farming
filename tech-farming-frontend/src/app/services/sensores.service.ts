// src/app/services/sensores.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sensor } from '../sensores/models/sensor.model';

export interface UltimaLectura {
  sensor_id: string;
  valor: number;
  timestamp: string;
  tipo_sensor?: string;
  zona?: string;
  invernadero_id?: string;
  parametro?: string;
  unidad?: string;
}

@Injectable({ providedIn: 'root' })
export class SensoresService {
  private apiUrl = 'http://localhost:5000/api/sensores';

  constructor(private http: HttpClient) {}

  /** 1) Listar sensores (Supabase vía API) */
  getSensores(): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(this.apiUrl);
  }

  /** 2) Crear sensor */
  crearSensor(sensor: Sensor): Observable<{ sensor_id: number; token: string }> {
    return this.http.post<{ sensor_id: number; token: string }>(this.apiUrl, sensor);
  }

  /** 3) Últimas lecturas (InfluxDB) */
  getUltimasLecturas(): Observable<UltimaLectura[]> {
    return this.http.get<UltimaLectura[]>(`${this.apiUrl}/ultimas-lecturas`);
  }

  /** 4) Enviar datos a InfluxDB */
  enviarDatosSensor(payload: { token: string; mediciones: { parametro: string; valor: number }[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/datos`, payload);
  }
}
