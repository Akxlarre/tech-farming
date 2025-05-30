// src/app/invernaderos/models/invernadero.model.ts
import { Sensor } from "../../models";

export interface Zona {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  creado_en: string;
  sensores?: Sensor[];  // Lista de sensores en esta zona
}

export interface Invernadero {
  id: number;
  nombre: string;
  descripcion?: string;
  creado_en: string;
  zonas?: Zona[];
  zonasActivas?: number;
  sensoresActivos?: number;
  sensoresTotales?: number;
  estado?: string;  // ej: "2 alertas activas" o "Sin alertas"
}
