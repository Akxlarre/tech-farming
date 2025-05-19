// src/app/invernaderos/invernadero.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invernadero } from './models/invernadero.model';

@Injectable({ providedIn: 'root' })
export class InvernaderoService {

  private apiUrl = 'http://localhost:5000/api/invernaderos';

  constructor(private http: HttpClient) {}

  /** 1) Listar todos los invernaderos (con sus zonas) */
  getInvernaderos(): Observable<Invernadero[]> {
    return this.http.get<Invernadero[]>(this.apiUrl);
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

  getAllInvernaderos(): Observable<Invernadero[]> {
    return this.http.get<Invernadero[]>(this.apiUrl);
  }
}