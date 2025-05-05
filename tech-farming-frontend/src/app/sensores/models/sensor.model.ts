// src/app/sensores/models/sensor.model.ts
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

  // Datos de la última lectura (vienen de InfluxDB)
  parametro?: string;   // ej: "Temperatura", "Humedad", "N", "Potasio"
  unidad?: number;      // valor numérico medido
  timestamp?: string;   // fecha/hora de la última lectura
}
