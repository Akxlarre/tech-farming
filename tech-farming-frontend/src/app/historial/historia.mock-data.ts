//historial/historia.mock-data.ts
import { Invernadero, Zona, Sensor, HistorialParams, HistorialData, TipoParametro } from '../models';
import { addDays, formatISO } from 'date-fns';

// 1) Invernaderos
export const MOCK_INVERNADEROS: Invernadero[] = [
  { id: 1, nombre: 'Invernadero A' },
  { id: 2, nombre: 'Invernadero B' }
];

// 2) Zonas
export const MOCK_ZONAS: Zona[] = [
  { id: 1, nombre: 'Zona Norte', invernaderoId: 1 },
  { id: 2, nombre: 'Zona Sur',   invernaderoId: 1 },
  { id: 3, nombre: 'Zona Útil',  invernaderoId: 2 }
];

// 3) Sensores
export const MOCK_SENSORES: Sensor[] = [
  { id: 1, nombre: 'Sensor 1', zonaId: 1, tipo: 'temperatura' },
  { id: 2, nombre: 'Sensor 2', zonaId: 1, tipo: 'humedad' },
  { id: 3, nombre: 'Sensor 3', zonaId: 2, tipo: 'p' },
  { id: 4, nombre: 'Sensor 4', zonaId: 3, tipo: 'n' }
];

// 4) Tipos de parámetro
export const MOCK_TIPOS_PARAMETRO: TipoParametro[] = [
  { id: 1, nombre: 'Temperatura', unidad: '°C' },
  { id: 2, nombre: 'Humedad',     unidad: '%'  },
  { id: 3, nombre: 'Fósforo',     unidad: 'mg/kg' },
  { id: 4, nombre: 'Nitrógeno',   unidad: 'mg/kg' },
  { id: 5, nombre: 'Potasio',     unidad: 'mg/kg' }
];

// 5) Helper para generar historial
export function generateMockHistorial(params: HistorialParams): HistorialData {
  const { fechaDesde, fechaHasta } = params;
  const days = Math.ceil((fechaHasta.getTime() - fechaDesde.getTime())/(1000*60*60*24));
  const series = Array.from({ length: days + 1 }).map((_, i) => {
    const date = addDays(fechaDesde, i);
    const value = Math.round(10 + Math.random() * 20);
    return { timestamp: formatISO(date), value };
  });
  const valores = series.map(s => s.value);
  const avg = valores.reduce((a,b) => a+b,0)/valores.length;
  const min = Math.min(...valores), max = Math.max(...valores);
  const idxMin = valores.indexOf(min), idxMax = valores.indexOf(max);
  const std = Math.sqrt(valores.reduce((sum,v)=>sum + (v-avg)**2,0)/valores.length);

  return {
    series,
    stats: {
      promedio: parseFloat(avg.toFixed(1)),
      minimo:  { value: min,  fecha: series[idxMin].timestamp },
      maximo:  { value: max,  fecha: series[idxMax].timestamp },
      desviacion: parseFloat(std.toFixed(1))
    }
  };
}
