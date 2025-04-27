import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Invernadero } from './models/invernadero.model';

@Injectable({ providedIn: 'root' })
export class InvernaderoService {
  private apiUrl = 'http://localhost:5000/api/invernaderos';

  constructor(private http: HttpClient) {}

  obtenerInvernaderos() {
      return this.http.get<Invernadero[]>(this.apiUrl);
    }
}
