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
import { AdminCardListComponent } from './components/admin-card-list.component';

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
    AdminCardListComponent,
    AdminCreateModalComponent,
    AdminEditModalComponent,
    AdminModalWrapperComponent],
  template: `
    <div *ngIf="!loading; else loadingTpl">
    <app-admin-header (create)="abrirModal()"></app-admin-header>
    <app-admin-filters (buscar)="filtrar($event)"></app-admin-filters>
    <div class="hidden md:block">
      <app-admin-table
        [usuarios]="usuariosFiltrados"
        [paginaActual]="paginaActual"
        [totalPaginas]="totalPaginas"
        [loading]="!isDataFullyLoaded"
        [rowCount]="pageSize"
        (paginaCambiada)="cambiarPagina($event)"
        (editarUsuario)="editar($event)">
      </app-admin-table>
    </div>

    <app-admin-card-list
      class="md:hidden"
      [usuarios]="usuariosFiltrados"
      [loading]="!isDataFullyLoaded"
      [rowCount]="pageSize"
      (editarUsuario)="editar($event)">
    </app-admin-card-list>

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
                (saved)="onUsuarioEditado()"
                (close)="modal.closeWithAnimation()">
            </app-admin-edit-modal>
          </ng-container>
        </ng-container>
      <!-- Otros tipos de modales (edit, delete) se agregarían aquí -->
      </ng-container>
    </app-admin-modal-wrapper>
    </div>
    <ng-template #loadingTpl>
      <div class="min-h-screen flex items-center justify-center bg-base-200">
        <svg class="animate-spin w-8 h-8 text-success mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    </ng-template>
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
  loading = true;
  isDataFullyLoaded = false;
  private loadCount = 0;
  private initialLoad = true;

  constructor(
    public modal: AdminModalService,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.startLoading();
    this.isDataFullyLoaded = false;
    this.adminService.getTrabajadores().subscribe({
      next: trabajadores => {
        this.usuarios = trabajadores;
        this.filtrar('');
        this.isDataFullyLoaded = true;
        this.endLoading();
      },
      error: () => this.endLoading()
    });
  }

  onUsuarioCreado(): void {
    this.modal.closeWithAnimation();
    this.cargarUsuarios();
  }

  onUsuarioEditado(): void {
    this.cargarUsuarios();
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

  private startLoading(): void {
    if (!this.initialLoad) return;
    this.loadCount++;
    this.loading = true;
  }

  private endLoading(): void {
    if (!this.initialLoad) return;
    if (this.loadCount > 0) {
      this.loadCount--;
    }
    if (this.loadCount === 0) {
      this.loading = false;
      this.initialLoad = false;
    }
  }
}