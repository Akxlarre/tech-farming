import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Permisos {
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/usuarios';

  /**
   * Invita al usuario y registra los datos en el backend.
   */
  async crearTrabajador(datos: {
    email: string;
    nombre: string;
    apellido: string;
    telefono: string;
    permisos: Permisos;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      await firstValueFrom(
        this.http.post<{ mensaje: string }>(`${this.baseUrl}/trabajadores`, datos)
      );

      return { success: true };
    } catch (err: any) {
      console.error('❌ Error al crear usuario:', err);
      return {
        success: false,
        error: err?.error?.error || 'Error inesperado al crear trabajador'
      };
    }
  }

  /**
   * Obtiene todos los trabajadores del administrador actual.
   */
  getTrabajadores(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/trabajadores`);
  }

  /**
   * Actualiza permisos del trabajador.
   */
  actualizarPermisos(usuarioId: number, permisos: Permisos): Observable<any> {
    return this.http.patch(`${this.baseUrl}/trabajadores/${usuarioId}`, {
      editar: permisos.editar,
      crear: permisos.crear,
      eliminar: permisos.eliminar
    });
  }
}
