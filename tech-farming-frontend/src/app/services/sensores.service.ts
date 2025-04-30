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
}

@Injectable({
  providedIn: 'root'
})
export class SensoresService {
  private apiUrl = 'http://localhost:5000/api/sensores';

  constructor(private http: HttpClient) {}

  getUltimasLecturas(): Observable<UltimaLectura[]> {
    return this.http.get<UltimaLectura[]>(`${this.apiUrl}/ultimas-lecturas`);
  }
}
