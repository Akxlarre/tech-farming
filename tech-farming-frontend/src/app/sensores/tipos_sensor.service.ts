import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoSensor } from './models/tipo-sensor.model';

@Injectable({ providedIn: 'root' })
export class TipoSensorService {
  private apiUrl = 'http://localhost:5000/api/tipos-sensor';

  constructor(private http: HttpClient) {}

  obtenerTiposSensor(): Observable<TipoSensor[]> {
    return this.http.get<TipoSensor[]>(this.apiUrl);
  }
}
