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
    <div class="p-4">
      <!-- Toolbar -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold">Umbrales</h3>
        <button class="btn btn-primary" (click)="nuevoUmbral()">+ Nuevo Umbral</button>
      </div>
      <div class="flex gap-4 mb-4">
        <input type="text" placeholder="Buscar..." [(ngModel)]="filter" class="input input-bordered flex-1" />
      </div>

      <!-- Tabs for scope -->
      <div class="tabs mb-4">
        <a *ngFor="let t of scopes; let i = index"
           class="tab tab-lg"
           [class.tab-active]="scopeIndex === i"
           (click)="switchScope(i)">
          {{ t | titlecase }}
        </a>
      </div>

      <!-- Table -->
      <table class="table w-full">
        <thead>
          <tr>
            <th>Parámetro</th>
            <th *ngIf="scopes[scopeIndex] === 'invernadero'">Invernadero ID</th>
            <th *ngIf="scopes[scopeIndex] === 'sensor'">Sensor Param ID</th>
            <th>Advertencia</th>
            <th>Crítico</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of filteredUmbrales()">
            <td>{{ u.tipo_parametro_id }}</td>
            <td *ngIf="scopes[scopeIndex] === 'invernadero'">{{ u.invernadero_id }}</td>
            <td *ngIf="scopes[scopeIndex] === 'sensor'">{{ u.sensor_parametro_id }}</td>
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

  constructor(
    private umbralService: UmbralService,
    public modal: UmbralModalService
  ) {}

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
    if (confirm(`¿Eliminar umbral ID ${u.id}?`)) {
      this.umbralService.eliminarUmbral(u.id).subscribe(() => this.loadUmbrales());
    }
  }
}
