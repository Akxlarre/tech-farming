// src/app/sensores/models/sensor.model.ts
import { TipoSensor } from './tipo-sensor.model';
import { TipoParametro } from './tipos_parametro.model';
import { Zona } from './zona.model';
import { Invernadero } from './invernadero.model';
import { LecturaSensor } from './lectura-sensor.model';

export interface Sensor {
    id: number;
    nombre: string;
    tipo_sensor: TipoSensor;
    zona: Zona;
    invernadero: Invernadero;
    estado: 'Activo' | 'Inactivo' | 'Mantenimiento';
    fecha_instalacion: string;
    parametros: {
      id: number;
      nombre: string;
      unidad?: string;
    }[];                
    ultimaLectura?: LecturaSensor|null;
  }