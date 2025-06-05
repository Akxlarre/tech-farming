export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  puedeEditar: boolean;
  puedeCrear: boolean;
  puedeEliminar: boolean;
}