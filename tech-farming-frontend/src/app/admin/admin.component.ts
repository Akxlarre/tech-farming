import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from './admin.service';
import { AdminModalService } from './admin-modal.service';
import { AdminHeaderComponent } from './components/admin-header.component';
import { AdminFiltersComponent } from './components/admin-filters.component';
import { AdminTableComponent } from './components/admin-table.component';
import { AdminCreateModalComponent } from './components/admin-create-modal.component';
import { AdminEditModalComponent } from './components/admin-edit-modal.component';
import { AdminModalWrapperComponent } from './components/admin-modal-wrapper.component';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    AdminHeaderComponent,
    AdminFiltersComponent,
    AdminTableComponent,
    AdminCreateModalComponent,
    AdminEditModalComponent,
    AdminModalWrapperComponent],
  template: `
    <app-admin-header (create)="abrirModal()"></app-admin-header>
    <app-admin-filters (buscar)="filtrar($event)"></app-admin-filters>
    <app-admin-table
      [usuarios]="usuariosFiltrados"
      [paginaActual]="paginaActual"
      [totalPaginas]="totalPaginas"
      (paginaCambiada)="cambiarPagina($event)"
      (editarUsuario)="editar($event)">
    </app-admin-table>

    <app-admin-modal-wrapper *ngIf="modal.modalType$ | async as type">
      <ng-container [ngSwitch]="type">
        <!-- CREAR USUARIO -->
        <ng-container *ngSwitchCase="'create'">
          <app-admin-create-modal
            (saved)="onUsuarioCreado()"
            (close)="modal.closeWithAnimation()"
          ></app-admin-create-modal>
        </ng-container>

        <!-- EDITAR USUARIO -->
        <ng-container *ngSwitchCase="'edit'">
          <ng-container *ngIf="selectedUsuario">
            <app-admin-edit-modal
            [usuario]="selectedUsuario"
                (saved)="onUsuarioEditado($event)"
                (close)="modal.closeWithAnimation()">
            </app-admin-edit-modal>
          </ng-container>
        </ng-container>
      <!-- Otros tipos de modales (edit, delete) se agregarían aquí -->
      </ng-container>
    </app-admin-modal-wrapper>
  `,
})
export class AdminComponent implements OnInit {
  usuarios: Usuario[] = [];
  selectedUsuario: any = null;
  usuariosFiltrados: Usuario[] = [];
  paginaActual = 1;
  totalPaginas = 1;
  pageSize = 5;
  totalUsuarios = 0;

  constructor(
    public modal: AdminModalService,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.adminService.getTrabajadores().subscribe(trabajadores => {
      this.usuarios = trabajadores;
      this.filtrar('');
    });
  }

  onUsuarioCreado(): void {
    this.modal.closeWithAnimation();
    this.cargarUsuarios();
  }

  onUsuarioEditado(usuarioEditado: any) {
    const index = this.usuarios.findIndex(u => u.id === usuarioEditado.id);
    if (index !== -1) {
      this.usuarios[index] = {
        ...this.usuarios[index],
        puedeEditar: usuarioEditado.permisos.editar,
        puedeCrear: usuarioEditado.permisos.crear,
        puedeEliminar: usuarioEditado.permisos.eliminar
      };
    }
    this.filtrar('');
  }

  filtrar(nombre: string) {
    const filtrados = this.usuarios.filter(u =>
      (u.nombre + ' ' + u.apellido).toLowerCase().includes(nombre.toLowerCase())
    );
    this.totalPaginas = Math.ceil(filtrados.length / this.pageSize);
    const inicio = (this.paginaActual - 1) * this.pageSize;
    this.usuariosFiltrados = filtrados.slice(inicio, inicio + this.pageSize);
    this.totalUsuarios = filtrados.length;
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
    this.filtrar('');
  }

  abrirModal() {
    this.modal.openModal('create');
  }

  editar(usuario: Usuario) {
    this.selectedUsuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      permisos: {
        editar: usuario.puedeEditar,
        crear: usuario.puedeCrear,
        eliminar: usuario.puedeEliminar
      }
    };
    this.modal.openModal('edit');
  }
}