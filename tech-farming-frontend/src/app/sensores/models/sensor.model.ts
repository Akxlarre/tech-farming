import { TipoSensor } from './tipo-sensor.model';
import { Zona } from './zona.model';
import { Invernadero } from './invernadero.model';
import { LecturaSensor } from './lectura-sensor.model';

export interface Sensor {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: 'Activo' | 'Inactivo' | 'Mantenimiento';
  fecha_instalacion?: string;
  tipo_sensor: TipoSensor;
  zona?: Zona;
  invernadero?: Invernadero;
  parametros: Array<{
    id: number;
    nombre: string;
    unidad?: string;
  }>;
  ultimaLectura?: LecturaSensor | null;
  alertaActiva?: boolean;
  
}
