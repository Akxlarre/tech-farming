// src/app/predicciones/predicciones.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { addHours, formatISO } from 'date-fns';

import {
  Invernadero,
  Zona,
  SeriesPoint,
  PredicParams,
  PredicResult,
  Summary,
  Trend
} from '../models';

// --- Mock Data for Predicciones ---
export const MOCK_INVERNADEROS: Invernadero[] = [
  { id: 1, nombre: 'Invernadero A' },
  { id: 2, nombre: 'Invernadero B' }
];

export const MOCK_ZONAS: Zona[] = [
  { id: 1, nombre: 'Zona Norte', invernaderoId: 1 },
  { id: 2, nombre: 'Zona Sur',   invernaderoId: 1 },
  { id: 3, nombre: 'Zona Útil',  invernaderoId: 2 }
];

/**
 * Genera datos de prueba: series histórica y futura, resumen y tendencia.
 */
function generateMockPredicciones(params: PredicParams): PredicResult {
  const now = new Date();
  const { horas } = params;

  // Histórica: últimos `horas` puntos horarios
  const historical: SeriesPoint[] = Array.from({ length: horas }).map((_, i) => {
    const ts = addHours(now, i - horas);
    const value = Math.round( 10 + Math.random() * 20 );
    return { timestamp: formatISO(ts), value };
  });

  // Futura: siguientes `horas` puntos horarios
  const future: SeriesPoint[] = Array.from({ length: horas }).map((_, i) => {
    const ts = addHours(now, i + 1);
    const lastHist = historical[historical.length - 1].value;
    const drift = (Math.random() - 0.5) * 5;
    const value = Math.round(Math.max(0, lastHist + drift));
    return { timestamp: formatISO(ts), value };
  });

  // Resumen
  const summary: Summary = {
    updated: now.toISOString(),
    text:    `Predicción de ${horas} horas para invernadero ${params.invernaderoId}`
  };

  // Tendencia: comparación de promedios
  const avgHist = historical.reduce((a, p) => a + p.value, 0) / historical.length;
  const avgFut  = future.reduce((a, p) => a + p.value, 0) / future.length;
  const diffPct = ((avgFut - avgHist) / avgHist) * 100;
  const trend: Trend = {
    text:       diffPct >= 0 ? 'Tendencia al alza' : 'Tendencia a la baja',
    comparison: `${Math.abs(diffPct).toFixed(1)}%`,
    icon:       diffPct >= 0 ? 'arrow-up' : 'arrow-down',
    color:      diffPct >= 0 ? 'success' : 'warning'
  };

  return { historical, future, summary, trend };
}

// --- Servicio Predicciones ---
@Injectable({ providedIn: 'root' })
export class PrediccionesService {
  /** GET /invernaderos */
  getInvernaderos(): Observable<Invernadero[]> {
    return of(MOCK_INVERNADEROS);
  }

  /** GET /invernaderos/{id}/zonas */
  getZonasByInvernadero(invernaderoId: number): Observable<Zona[]> {
    const lista = MOCK_ZONAS.filter(z => z.invernaderoId === invernaderoId);
    return of(lista);
  }

  /** GET /predicciones?invernaderoId=&zonaId=&horas= */
  getPredicciones(params: PredicParams): Observable<PredicResult> {
    // Mock: genera datos de ejemplo
    const result = generateMockPredicciones(params);
    return of(result);
  }
}
