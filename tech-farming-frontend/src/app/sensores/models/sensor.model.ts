export interface Sensor {
  id?: number;
  invernadero_id: number;
  nombre: string;
  descripcion?: string;
  estado?: string;
  fecha_instalacion?: string;
  pos_x?: number;
  pos_y?: number;
  tipo_sensor_id: number;
}
