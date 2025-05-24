import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Alerta {
  id: number;
  sensor_parametro_id: number;
  tipo: string;
  nivel: 'advertencia' | 'critico';
  valor_detectado: number;
  fecha_hora: string;
  mensaje: string;
  estado: 'activo' | 'historico';
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private baseUrl = 'http://localhost:5000/api/alertas';

  constructor(private http: HttpClient) {}

  getAlertas(
    estado?: 'activo' | 'historico',
    nivel?: 'advertencia' | 'critico',
    invernadero_id?: number,
    zona_id?: number,
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
    if (busqueda) params = params.set('busqueda', busqueda);
    return this.http.get<{ data: Alerta[]; pagination: any }>(this.baseUrl, { params });
  }

  resolverAlerta(id: number, resuelta_por: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/resolver`, { resuelta_por });
  }
}
