import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class SensoresService {
  private apiUrl = 'http://localhost:5000/api/sensores';

  constructor(private http: HttpClient) {}

  // Obtiene las últimas lecturas desde el backend
  getUltimasLecturas(): Observable<UltimaLectura[]> {
    return this.http.get<UltimaLectura[]>(`${this.apiUrl}/ultimas-lecturas`);
  }

  // Envía datos de sensores al backend (InfluxDB)
  enviarDatosSensor(payload: {
    token: string;
    mediciones: {
      parametro: string;
      valor: number;
    }[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/datos`, payload);
  }
}
