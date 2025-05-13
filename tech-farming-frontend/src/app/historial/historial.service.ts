//historial/historial.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Invernadero,
  Zona,
  Sensor,
  HistorialParams,
  HistorialData,
  TipoParametro
} from '../models';
import {
  MOCK_INVERNADEROS,
  MOCK_ZONAS,
  MOCK_SENSORES,
  MOCK_TIPOS_PARAMETRO,
  generateMockHistorial
} from './historia.mock-data';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  getInvernaderos(): Observable<Invernadero[]> {
    return of(MOCK_INVERNADEROS);
  }

  getZonasByInvernadero(id: number): Observable<Zona[]> {
    return of(MOCK_ZONAS.filter(z => z.invernaderoId === id));
  }

  getSensoresByZona(id: number): Observable<Sensor[]> {
    return of(MOCK_SENSORES.filter(s => s.zonaId === id));
  }

  getTiposParametro(): Observable<TipoParametro[]> {
    return of(MOCK_TIPOS_PARAMETRO);
  }

  getHistorial(params: HistorialParams): Observable<HistorialData> {
    return of(generateMockHistorial(params));
  }
}
