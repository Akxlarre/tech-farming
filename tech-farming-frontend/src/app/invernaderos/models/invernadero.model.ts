export interface Zona {
  id?: number;
  nombre: string;
  descripcion?: string;
  creado_en?: string;   // ISO timestamp string
  activo?: boolean;
}

export interface Invernadero {
  id?: number;
  nombre: string;
  descripcion?: string;
  creado_en?: string;           // ISO timestamp string
  sensoresActivos?: number;     // calculado en backend
  estado: 'Activo' | 'Inactivo' | 'Mantenimiento' | string;
  zonas?: Zona[];               // lista de zonas asociadas
}
