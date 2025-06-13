import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Alerta {
  id: number;
  sensor_parametro_id: number;
  sensor_nombre: string;
  /** Nombre del tipo de parámetro asociado al sensor */
  tipo_parametro?: string;
  tipo: string;
  nivel: 'Advertencia' | 'Crítico';
  valor_detectado: number;
  fecha_hora: string;
  fecha_resolucion?: string;
  mensaje: string;
  estado: 'Activa' | 'Resuelta';
  resuelta_por?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private baseUrl = 'http://localhost:5000/api/alertas';

  constructor(private http: HttpClient) {}

  getAlertas(
    estado?: 'Activa' | 'Resuelta',
    nivel?: 'Advertencia' | 'Crítico',
    invernadero_id?: number,
    zona_id?: number,
    sensor_id?: number,
    busqueda?: string,
    page: number = 1,
    perPage: number = 20

  ): Observable<{ data: Alerta[]; pagination: any }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('perPage', perPage.toString());
      
    if (estado) params = params.set('estado', estado);
    if (nivel) params = params.set('nivel', nivel);
    if (invernadero_id) params = params.set('invernadero_id', invernadero_id.toString());
    if (zona_id) params = params.set('zona_id', zona_id.toString());
    if (sensor_id) params = params.set('sensor_id', sensor_id.toString());
    if (busqueda) params = params.set('busqueda', busqueda);
    return this.http.get<{ data: Alerta[]; pagination: any }>(this.baseUrl, { params });
  }

  resolverAlerta(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/resolver`, {});
  }
}
