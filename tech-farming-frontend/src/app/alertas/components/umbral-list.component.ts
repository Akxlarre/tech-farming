import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UmbralService, Umbral } from '../umbral.service';
import { UmbralModalService } from '../umbral-modal.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-umbral-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal Confirmación Eliminar -->
    <div *ngIf="confirmDeleteVisible"
         class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-xl shadow-xl text-center w-[300px] space-y-3">
        <h3 class="text-lg font-semibold text-error">¿Eliminar Umbral?</h3>
        <p class="text-sm text-base-content/80">
          Esta acción desactivará el umbral de forma permanente.
        </p>
        <div class="flex justify-center gap-4 pt-2">
          <button class="btn btn-outline btn-neutral" (click)="cancelarEliminar()">Cancelar</button>
          <button class="btn btn-error" (click)="confirmarEliminar()">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmación Eliminación Exitosa -->
    <div *ngIf="deleteExitosoVisible"
        class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-xl shadow-xl text-center w-[300px] space-y-2">
        <h3 class="text-xl font-semibold text-green-600">
          ✅ ¡Éxito!
        </h3>
        <p>{{ mensajeDeleteExitoso }}</p>
      </div>
    </div>


    <!-- Vista Principal -->
    <div class="p-4">
      <!-- Toolbar -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">Umbrales</h2>
        <button class="btn btn-ghost" (click)="modal.closeModal()">✕</button>
      </div>
      <div class="flex gap-4 mb-4">
        <input type="text" placeholder="Buscar..." [(ngModel)]="filter" class="input input-bordered flex-1" />
      </div>

      <!-- Tabs for scope -->
      <div class="flex justify-between items-center mb-4">
        <div class="tabs">
          <a *ngFor="let t of scopes; let i = index"
            class="tab tab-lg"
            [class.tab-active]="scopeIndex === i"
            (click)="switchScope(i)">
           {{ t | titlecase }}
          </a>
        </div>
        <button class="btn btn-primary btn-md" (click)="nuevoUmbral()">+ Nuevo Umbral</button>
      </div>

      <!-- Table -->
      <table class="table w-full">
        <thead>
          <tr>
            <th>Parámetro</th>
            <th *ngIf="scopes[scopeIndex] === 'invernadero'">Invernadero</th>
            <th *ngIf="scopes[scopeIndex] === 'sensor'">Invernadero</th>
            <th *ngIf="scopes[scopeIndex] === 'sensor'">Sensor</th>
            <th>Advertencia</th>
            <th>Crítico</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of filteredUmbrales()">
            <td>{{ u.tipo_parametro_nombre }} ({{ u.tipo_parametro_unidad }})</td>
            <td *ngIf="scopes[scopeIndex] === 'invernadero'">{{ u.invernadero_nombre }}</td>
            <td *ngIf="scopes[scopeIndex] === 'sensor'">{{ u.sensor_invernadero_nombre }}</td>
            <td *ngIf="scopes[scopeIndex] === 'sensor'">{{ u.sensor_nombre }}</td>
            <td>{{ u.advertencia_min }} – {{ u.advertencia_max }}</td>
            <td>{{ u.critico_min || '-' }} – {{ u.critico_max || '-' }}</td>
            <td class="text-right">
              <button class="btn btn-sm btn-outline mr-2" (click)="editar(u)">✏️</button>
              <button class="btn btn-sm btn-error" (click)="eliminar(u)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class UmbralListComponent implements OnInit {
  scopes: Array<'global' | 'invernadero' | 'sensor'> = ['global', 'invernadero', 'sensor'];
  scopeIndex = 0;
  umbrales: Umbral[] = [];
  filter = '';

  confirmDeleteVisible = false;
  umbralAEliminar: Umbral | null = null;
  deleteExitosoVisible = false;
  mensajeDeleteExitoso = '';

  constructor(
    private umbralService: UmbralService,
    public modal: UmbralModalService
  ) { }

  ngOnInit() {
    this.loadUmbrales();
  }

  switchScope(index: number) {
    this.scopeIndex = index;
    this.loadUmbrales();
  }

  loadUmbrales() {
    const ambito = this.scopes[this.scopeIndex];
    this.umbralService.getUmbrales(ambito).subscribe(list => this.umbrales = list);
  }

  filteredUmbrales(): Umbral[] {
    if (!this.filter) return this.umbrales;
    const term = this.filter.toLowerCase();
    return this.umbrales.filter(u =>
      (u.tipo_parametro_id && u.tipo_parametro_id.toString().includes(term)) ||
      (u.invernadero_id && u.invernadero_id.toString().includes(term)) ||
      (u.sensor_parametro_id && u.sensor_parametro_id.toString().includes(term))
    );
  }

  nuevoUmbral() {
    this.modal.openModal('create');
  }

  editar(u: Umbral) {
    this.modal.openModal('edit', u);
  }

  eliminar(u: Umbral) {
    this.umbralAEliminar = u;
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
      }, 1500);
    });
  }

  cancelarEliminar() {
    this.confirmDeleteVisible = false;
    this.umbralAEliminar = null;
  }
}
