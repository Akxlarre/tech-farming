import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Umbral {
  id: number;
  tipo_parametro_id: number | null;
  invernadero_id: number | null;
  sensor_parametro_id: number | null;
  advertencia_min: number;
  advertencia_max: number;
  critico_min?: number;
  critico_max?: number;
  activo: boolean;
  creado_en: string;
}

@Injectable({
  providedIn: 'root'
})
export class UmbralService {
  private baseUrl = '/api/umbrales';

  constructor(private http: HttpClient) {}

  getUmbrales(
    ambito?: 'global' | 'invernadero' | 'sensor',
    tipo_parametro_id?: number,
    invernadero_id?: number,
    sensor_parametro_id?: number
  ): Observable<Umbral[]> {
    let params = new HttpParams();
    if (ambito) params = params.set('ambito', ambito);
    if (tipo_parametro_id) params = params.set('tipo_parametro_id', tipo_parametro_id.toString());
    if (invernadero_id) params = params.set('invernadero_id', invernadero_id.toString());
    if (sensor_parametro_id) params = params.set('sensor_parametro_id', sensor_parametro_id.toString());
    return this.http.get<Umbral[]>(this.baseUrl, { params });
  }

  crearUmbral(umbral: Partial<Umbral>): Observable<Umbral> {
    return this.http.post<Umbral>(this.baseUrl, umbral);
  }

  actualizarUmbral(id: number, umbral: Partial<Umbral>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, umbral);
  }

  eliminarUmbral(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
