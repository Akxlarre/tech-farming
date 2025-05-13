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
    tipo: 'temperatura'|'humedad'|'p'|'n'|'k';
  }
  
  export interface TipoParametro {
    id: number;
    nombre: string;
    unidad: string;
  }
  
  export interface HistorialParams {
    invernaderoId?: number;
    zonaId?: number;
    sensorId?: number;
    tipoParametroId: number;
    fechaDesde: Date;
    fechaHasta: Date;
  }
  
  export interface HistorialData {
    series: Array<{ timestamp: string; value: number }>;
    stats: {
      promedio: number;
      minimo: { value: number; fecha: string };
      maximo: { value: number; fecha: string };
      desviacion: number;
    };
  }
  