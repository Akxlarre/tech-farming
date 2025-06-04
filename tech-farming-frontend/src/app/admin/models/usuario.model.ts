export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  puedeEditar: boolean;
  puedeCrear: boolean;
  puedeEliminar: boolean;
}