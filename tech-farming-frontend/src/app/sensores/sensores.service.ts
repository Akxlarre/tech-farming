import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sensor } from './models/sensor.model';

@Injectable({ providedIn: 'root' })
export class SensorService {
  private apiUrl = 'http://localhost:5000/api/sensores';

  constructor(private http: HttpClient) {}

  crearSensor(sensor: Sensor): Observable<{ sensor_id: number; token: string }> {
    return this.http.post<{ sensor_id: number; token: string }>(this.apiUrl, sensor);
  }

}