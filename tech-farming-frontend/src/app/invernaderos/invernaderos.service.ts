// src/app/invernaderos/invernaderos.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Invernadero, Zona } from './models/invernadero.model';

export interface InvernaderoFilters {
  search?: string;
  sortBy?: string;
}

export interface InvernaderoPageResponse {
  data: Invernadero[];
  total: number;
}

/**
 * Resumen de cuántas entidades serán eliminadas en cascada
 * al borrar un invernadero: zonas, sensores y alertas.
 */
export interface ResumenEliminacion {
  zonasCount: number;
  sensoresCount: number;
  alertasCount: number;
}

/**
 * Payload para la actualización completa de un invernadero:
 * - nombre, descripción
 * - arreglo de zonas (algunas con `id` si ya existían, otras con `id=null` para nuevas)
 * - arreglo de IDs de zonas que deben eliminarse en cascada
 */
export interface EditInvernaderoPayload {
  nombre: string;
  descripcion?: string;
  zonas: Array<{
    id?: number;          // null o undefined → nueva zona
    nombre: string;
    descripcion?: string;
    activo: boolean;
  }>;
  zonasEliminadas: number[];
}

@Injectable({ providedIn: 'root' })
export class InvernaderoService {
  private baseUrl = 'http://localhost:5000/api/invernaderos';

  constructor(private http: HttpClient) { }

  /**
   * Devuelve todos los invernaderos (sin paginar).
   * Usado por Alertas, Sensores, etc.
   */
  getInvernaderos(): Observable<Invernadero[]> {
    return this.http.get<Invernadero[]>(`${this.baseUrl}/getInvernaderos`);
  }

  /**
   * Devuelve una página de invernaderos (paginado + filtros).
   * ---------------------------------------------------------
   * GET /api/invernaderos?page=1&pageSize=8&search=...&sortBy=...
   */
  getInvernaderosPage(
    page: number,
    pageSize: number,
    filters: InvernaderoFilters
  ): Observable<InvernaderoPageResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }

    return this.http.get<InvernaderoPageResponse>(`${this.baseUrl}`, { params });
  }

  /**
   * Devuelve únicamente los estados de alerta para cada invernadero en la página actual.
   * ---------------------------------------------------------
   * GET /api/invernaderos/estados-alerta?page=1&pageSize=8
   */
  getEstadosAlerta(
    page: number,
    pageSize: number
  ): Observable<Array<{ id: number; estado: string; hayAlertas: boolean }>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<Array<{ id: number; estado: string; hayAlertas: boolean }>>(
      `${this.baseUrl}/estados-alerta`,
      { params }
    );
  }

  /**
   * Crea un nuevo invernadero junto con sus zonas.
   * ---------------------------------------------------------
   * POST /api/invernaderos
   *   { nombre, descripcion?, zonas: [ { nombre, descripcion?, activo? }... ] }
   */
  crearInvernadero(payload: {
    nombre: string;
    descripcion?: string;
    zonas: Array<{ nombre: string; descripcion?: string; activo?: boolean }>;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, payload);
  }

  /**
   * Obtiene los datos completos de un invernadero (incluye sus zonas y sensores).
   * ---------------------------------------------------------
   * GET /api/invernaderos/{id}
   */
  getInvernaderoDetalle(id: number): Observable<Invernadero & { zonas: Zona[] }> {
    return this.http.get<Invernadero & { zonas: Zona[] }>(
      `${this.baseUrl}/${id}`
    );
  }

  /**
   * Actualiza un invernadero completo:
   *   - modifica nombre/ descripción
   *   - crea/actualiza zonas
   *   - elimina en cascada las zonas marcadas
   * ---------------------------------------------------------
   * PUT /api/invernaderos/{id}
   *   { nombre, descripcion?, zonas: [ { id?, nombre, descripcion?, activo }... ], zonasEliminadas: [id1, id2...] }
   */
  actualizarInvernaderoCompleto(
    id: number,
    payload: EditInvernaderoPayload
  ): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * Consulta cuántas entidades (zonas, sensores, alertas) serán eliminadas en cascada
   * si se borra el invernadero especificado.
   * ---------------------------------------------------------
   * GET /api/invernaderos/{id}/delete-summary
   */
  obtenerResumenEliminacion(id: number): Observable<ResumenEliminacion> {
    return this.http.get<ResumenEliminacion>(
      `${this.baseUrl}/${id}/delete-summary`
    );
  }

  /**
   * Elimina el invernadero completo (y, por cascada, sus zonas, sensores y alertas).
   * ---------------------------------------------------------
   * DELETE /api/invernaderos/{id}
   */
  eliminarInvernadero(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  getAlertasActivasCount(invId: number): Observable<{ alertasActivasCount: number }> {
    return this.http.get<{ alertasActivasCount: number }>(
      `${this.baseUrl}/${invId}/alertas-activas-count`
    );
  }


  getAlertasByType(invId: number, tipo: string): Observable<Array<{ id: number; tipo: string; mensaje: string }>> {
    return this.http.get<Array<{ id: number; tipo: string; mensaje: string }>>(
      `${this.baseUrl}/${invId}/alertas?tipo=${tipo}`
    );
  }
}
