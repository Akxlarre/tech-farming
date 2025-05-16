export interface Invernadero {
  id: number;
  nombre: string;
}

export interface Zona {
  id: number;
  nombre: string;
  invernaderoId: number;
}

export interface Sensor {
  id: number;
  nombre: string;
  zonaId: number;
  tipo: 'temperatura' | 'humedad' | 'p' | 'n' | 'k';
}

export interface TipoParametro {
  id: number;
  nombre: string;
  unidad: string;
}

// Parámetros y datos para Historial
export interface HistorialParams {
  invernaderoId?: number;
  zonaId?:        number;
  sensorId?:      number;
  tipoParametroId: number;
  fechaDesde:     Date;
  fechaHasta:     Date;
}

export interface HistorialData {
  series: Array<{ timestamp: string; value: number }>;
  stats: {
    promedio: number;
    minimo:  { value: number; fecha: string };
    maximo:  { value: number; fecha: string };
    desviacion: number;
  };
}

// Modelos para Predicciones
/** Un punto de datos en una serie */
export interface SeriesPoint {
  timestamp: string; // ISO date string
  value:     number;
}

/** Parámetros para solicitar predicciones */
export interface PredicParams {
  invernaderoId: number;
  zonaId?:       number;
  horas:         6 | 12 | 24;
}

/** Resumen de la predicción */
export interface Summary {
  updated: string;
  text:    string;
  action?: string;
}

/** Descripción de tendencia */
export interface Trend {
  text:       string;
  comparison: string;
  icon:       'chart-line' | 'arrow-up' | 'arrow-down' | 'info-circle';
  color?:     'success' | 'warning' | 'error' | 'info';
}

/** Resultado completo de la API de predicciones */
export interface PredicResult {
  historical: SeriesPoint[];
  future:     SeriesPoint[];
  summary:    Summary;
  trend:      Trend;
}
export interface Alerta {
  id: number;
  sensor_parametro_id: number;
  tipo: string;
  nivel: 'advertencia' | 'critico';
  valor_detectado: number;
  fecha_hora: string;
  mensaje: string;
  estado: 'activo' | 'resuelta';
  resuelta_en?: string;
  resuelta_por?: number;
}

// Modelos para Umbrales
export interface Umbral {
  id: number;
  tipo_parametro_id: number | null;
  invernadero_id: number | null;
  sensor_parametro_id: number | null;
  advertencia_min: number;
  advertencia_max: number;
  critico_min?: number;
  critico_max?: number;
  activo: boolean;
  creado_en: string;
}
