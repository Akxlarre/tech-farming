import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoParametro } from './models/tipos_parametro.model';

@Injectable({ providedIn: 'root' })
export class TipoParametroService {
  private apiUrl = 'http://localhost:5000/api/tipos-parametro';

  constructor(private http: HttpClient) {}

  obtenerTiposParametro(): Observable<TipoParametro[]> {
    return this.http.get<TipoParametro[]>(this.apiUrl);
  }
}
