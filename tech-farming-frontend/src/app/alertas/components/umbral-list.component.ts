import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { UmbralService, Umbral } from '../umbral.service';
import { UmbralModalService } from '../umbral-modal.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-umbral-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Confirmación Eliminar -->
    <div *ngIf="confirmDeleteVisible" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-base-100 p-6 rounded-xl shadow-xl text-center w-[300px] space-y-3 border border-base-300">
        <h3 class="text-lg font-semibold text-error">¿Eliminar Umbral?</h3>

        <ng-container *ngIf="umbralAEliminar?.activo; else confirmarTexto">
          <p class="text-sm text-base-content/80">
            Para eliminar este umbral, debe estar en estado <strong>Inactivo</strong>.
          </p>
        </ng-container>

        <ng-template #confirmarTexto>
          <p class="text-sm text-base-content/80">Esta acción eliminará el umbral de forma permanente.</p>
          <p class="text-sm mt-2">Escribe <strong>"Eliminar"</strong> para confirmar:</p>
          <input
            type="text"
            class="input input-bordered w-full"
            [(ngModel)]="textoConfirmacion"
            placeholder="Escribe aquí"
          />
        </ng-template>

        <div class="flex justify-center gap-4 pt-2">
          <button class="btn btn-outline btn-neutral" (click)="cancelarEliminar()">Cancelar</button>

          <button
            *ngIf="!umbralAEliminar?.activo"
            class="btn btn-error"
            [disabled]="textoConfirmacion !== 'Eliminar'"
            (click)="confirmarEliminar()"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmación Éxito -->
    <div *ngIf="deleteExitosoVisible" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-base-100 p-6 rounded-xl shadow-xl text-center w-[300px] space-y-2 border border-base-300">
        <h3 class="text-xl font-semibold text-success">✅ ¡Éxito!</h3>
        <p>{{ mensajeDeleteExitoso }}</p>
      </div>
    </div>

    <!-- Vista Principal -->
    <div class="p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-[1.625rem] font-bold text-success flex items-center gap-2">Umbrales</h2>
        <button class="btn btn-ghost" (click)="modal.closeModal()">✕</button>
      </div>

      <!-- Tabs -->
      <div class="flex justify-between items-center mb-4">
        <div class="tabs">
          <a *ngFor="let t of scopes; let i = index" class="tab tab-lg" [class.tab-active]="scopeIndex === i" (click)="switchScope(i)">
            {{ t | titlecase }}
          </a>
        </div>
        <button
          *ngIf="puedeCrear"
          class="btn bg-transparent border-success text-base-content hover:bg-success hover:text-success-content"
          (click)="nuevoUmbral(); $event.stopPropagation()"
        >
          + Nuevo Umbral
        </button>
      </div>

      <!-- Tabla -->
      <table class="table w-full">
        <thead>
          <tr>
            <th>Parámetro</th>
            <th *ngIf="scopes[scopeIndex] === 'invernadero'">Invernadero</th>
            <th *ngIf="scopes[scopeIndex] === 'sensor'">Invernadero</th>
            <th *ngIf="scopes[scopeIndex] === 'sensor'">Sensor</th>
            <th>Advertencia</th>
            <th>Crítico</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of umbrales">
            <td>{{ u.tipo_parametro_nombre }} ({{ u.tipo_parametro_unidad }})</td>
            <td *ngIf="scopes[scopeIndex] === 'invernadero'">{{ u.invernadero_nombre }}</td>
            <td *ngIf="scopes[scopeIndex] === 'sensor'">{{ u.sensor_invernadero_nombre }}</td>
            <td *ngIf="scopes[scopeIndex] === 'sensor'">{{ u.sensor_nombre }}</td>
            <td>{{ u.advertencia_min }} – {{ u.advertencia_max }}</td>
            <td>{{ u.critico_min || '-' }} – {{ u.critico_max || '-' }}</td>
            <td>
              <span
                class="badge"
                [ngClass]="u.activo ? 'badge-success' : 'badge-warning'"
              >
                {{ u.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="text-right">
              <button *ngIf="puedeEditar" class="btn btn-sm btn-outline mr-2" (click)="editar(u); $event.stopPropagation()">✏️</button>
              <button *ngIf="puedeEliminar" class="btn btn-sm btn-error" (click)="eliminar(u)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div class="flex items-center justify-between p-6 bg-base-200 rounded-lg mt-6" *ngIf="totalPages >= 0">
        <div class="text-sm text-base-content/70">
          Página {{ totalPages === 0 ? 0 : currentPage }} de {{ totalPages }} · {{ totalUmbrales }} umbral{{ totalUmbrales !== 1 ? 'es' : '' }}
        </div>

        <div class="flex items-center gap-2" *ngIf="totalPages > 1">
          <button class="btn btn-sm btn-outline rounded-full" (click)="goToPage(1)" [disabled]="currentPage === 1">«</button>
          <button class="btn btn-sm btn-outline rounded-full" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">‹</button>

          <ng-container *ngFor="let item of paginationItems()">
            <ng-container *ngIf="item !== '…'; else dots">
              <button
                class="btn btn-sm rounded-full"
                [ngClass]="{
                  'btn-success text-base-content border-success cursor-default': item === currentPage,
                  'btn-outline': item !== currentPage
                }"
                (click)="goToPage(+item)" [disabled]="item === currentPage">
                {{ item }}
              </button>
            </ng-container>
            <ng-template #dots>
              <span class="px-2 text-base-content/60 select-none">…</span>
            </ng-template>
          </ng-container>

          <button class="btn btn-sm btn-outline rounded-full" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">›</button>
          <button class="btn btn-sm btn-outline rounded-full" (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages">»</button>
        </div>
      </div>
    </div>
  `
})
export class UmbralListComponent implements OnInit {
  scopes: Array<'global' | 'invernadero' | 'sensor'> = ['global', 'invernadero', 'sensor'];
  scopeIndex = 0;
  umbrales: Umbral[] = [];

  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  totalUmbrales = 0;

  textoConfirmacion = '';
  confirmDeleteVisible = false;
  umbralAEliminar: Umbral | null = null;
  deleteExitosoVisible = false;
  mensajeDeleteExitoso = '';

  // permisos
  puedeCrear = false;
  puedeEditar = false;
  puedeEliminar = false;

  constructor(
    private supaSvc: SupabaseService,
    private umbralService: UmbralService,
    public modal: UmbralModalService
  ) { }

  async ngOnInit() {
    // Obtener sesión activa
    const session = await this.supaSvc.supabase.auth.getSession();
    const user = session.data?.session?.user;

    if (user) {
      // Buscar ID del usuario en la tabla relacional
      const { data: usuario } = await this.supaSvc.supabase
        .from('usuarios')
        .select('id')
        .eq('supabase_uid', user.id)
        .single();

      if (usuario?.id) {
        const { data: permisos } = await this.supaSvc.supabase
          .from('usuarios_permisos')
          .select('*')
          .eq('usuario_id', usuario.id)
          .single();

        this.puedeCrear = permisos?.puede_crear ?? false;
        this.puedeEditar = permisos?.puede_editar ?? false;
        this.puedeEliminar = permisos?.puede_eliminar ?? false;
      }
    }

    this.loadUmbrales();
  }

  switchScope(index: number) {
    this.scopeIndex = index;
    this.currentPage = 1;
    this.loadUmbrales();
  }

  loadUmbrales() {
    const ambito = this.scopes[this.scopeIndex];
    this.umbralService.getUmbrales(ambito, undefined, undefined, undefined, this.currentPage, this.pageSize)
      .subscribe(response => {
        this.umbrales = response.data;
        this.totalPages = response.pagination.pages;
        this.totalUmbrales = response.pagination.total === 0 ? 0 : response.pagination.total;
      });
  }

  paginationItems(): Array<number | string> {
    const total = this.totalPages;
    const cur = this.currentPage;
    const delta = 1;
    const pages: Array<number | string> = [];
    let last = 0;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= cur - delta && i <= cur + delta)) {
        if (last && i - last > 1) pages.push('…');
        pages.push(i);
        last = i;
      }
    }
    return pages;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadUmbrales();
  }

  nuevoUmbral() {
    this.modal.openModal('create');
  }

  editar(u: Umbral) {
    this.modal.openModal('edit', u);
  }

  eliminar(u: Umbral) {
    this.umbralAEliminar = u;
    this.textoConfirmacion = ''; 
    this.confirmDeleteVisible = true;
  }

  confirmarEliminar() {
    if (!this.umbralAEliminar) return;
    this.umbralService.eliminarUmbral(this.umbralAEliminar.id).subscribe(() => {
      this.loadUmbrales();
      this.confirmDeleteVisible = false;
      this.umbralAEliminar = null;

      this.mensajeDeleteExitoso = 'Umbral eliminado correctamente.';
      this.deleteExitosoVisible = true;

      setTimeout(() => {
        this.deleteExitosoVisible = false;
      }, 2500);
    });
  }

  cancelarEliminar() {
    this.confirmDeleteVisible = false;
    this.umbralAEliminar = null;
    this.textoConfirmacion = '';
  }
}
