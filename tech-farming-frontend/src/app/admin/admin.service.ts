import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
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
  telefono: string;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private _supabaseClient = inject(SupabaseService).supabase;
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
    adminId: number;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this._supabaseClient.auth.admin.inviteUserByEmail(datos.email);

      if (error || !data?.user?.id) {
        return { success: false, error: error?.message || 'Error al invitar al usuario.' };
      }

      const supabase_uid = data.user.id;

      await this.http.post(`${this.baseUrl}/trabajadores`, {
        supabase_uid,
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
        permisos: datos.permisos,
        admin_id: datos.adminId
      }).toPromise();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error inesperado' };
    }
  }

  /**
   * Obtiene todos los trabajadores del administrador actual.
   */
  getTrabajadores(adminId: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/trabajadores?admin_id=${adminId}`);
  }

  /**
   * Actualiza permisos del trabajador.
   */
  actualizarPermisos(usuarioId: number, permisos: Permisos): Observable<any> {
    return this.http.patch(`${this.baseUrl}/trabajadores/${usuarioId}`, {
      permisos
    });
  }
}
