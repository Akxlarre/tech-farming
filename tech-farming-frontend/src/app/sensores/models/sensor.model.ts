export interface Sensor {
  invernadero_id: number;
  nombre: string;
  descripcion?: string;
  estado?: boolean;
  fecha_instalacion?: string;
  pos_x?: number;
  pos_y?: number;
  zona: string;
  tipo_sensor_id: number;
}
