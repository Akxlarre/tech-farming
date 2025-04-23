import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Invernadero } from './models/invernadero.model';

@Injectable({ providedIn: 'root' })
export class InvernaderoService {
  private apiUrl = 'http://localhost:5000/api/invernaderos';

  constructor(private http: HttpClient) {}

  obtenerInvernaderos() {
    return this.http.get<Invernadero[]>(this.apiUrl);
  }
}
