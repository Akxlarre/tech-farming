// src/app/invernaderos/invernadero.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invernadero } from './models/invernadero.model';


export interface InvernaderoFilters {
  search?: string;
  sortBy?: string; // ej: 'nombre', '-creado_en', 'zonasActivas', '-sensoresActivos'
}

export interface InvernaderoPagedResponse {
  data: Invernadero[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class InvernaderoService {

  private apiUrl = 'http://localhost:5000/api/invernaderos';

  constructor(private http: HttpClient) {}

  /** 1) Listar todos los invernaderos (con sus zonas) */
  getInvernaderos(): Observable<Invernadero[]> {
    return this.http.get<Invernadero[]>(`${this.apiUrl}/getInvernaderos`);
  }

  getInvernaderosPage(
    page: number,
    pageSize: number,
    filters: InvernaderoFilters = {}
  ): Observable<InvernaderoPagedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    Object.entries(filters).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') {
        params = params.set(key, val);
      }
    });

    return this.http.get<InvernaderoPagedResponse>(this.apiUrl, { params });
  }
  /** 2) Crear un invernadero (incluye zonas en el body) */
  crearInvernadero(inv: Invernadero): Observable<Invernadero> {
    return this.http.post<Invernadero>(this.apiUrl, inv);
  }

  /** 3) Editar un invernadero por ID */
  editarInvernadero(inv: Invernadero): Observable<Invernadero> {
    if (!inv.id) {
      throw new Error('El invernadero debe tener un id para editar');
    }
    return this.http.put<Invernadero>(
      `${this.apiUrl}/${inv.id}`,
      inv
    );
  }

  /** 4) Eliminar un invernadero (y sus zonas por cascade) */
  eliminarInvernadero(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** 5) Obtener un invernadero por ID */
  obtenerInvernaderoPorId(id: number): Observable<Invernadero> {
    return this.http.get<Invernadero>(`${this.apiUrl}/${id}`);
  }

  getEstadosAlerta(page: number, pageSize: number): Observable<{ id: number; estado: string }[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
  
    return this.http.get<{ id: number; estado: string }[]>(
      `${this.apiUrl}/estados-alerta`,
      { params }
    );
  }
}