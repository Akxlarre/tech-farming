// src/app/invernaderos/components/view-invernadero.component.ts

import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnChanges,
    SimpleChanges,
    ElementRef,
    ViewChild,
    AfterViewInit,
    OnDestroy
  } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { HttpClientModule, HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
  
import { InvernaderoService } from '../invernaderos.service';
import { ZonaService } from '../zona.service';
import { AlertService } from '../../alertas/alertas.service';
  
  interface SensorDetalle {
    id: number;
    nombre: string;
    descripcion?: string;
    estado: string;
    fecha_instalacion: string;
    tipo_sensor: { id: number; nombre: string };
    zona: { id: number; nombre: string } | null;
  }
  
  interface AlertaResumen {
    id: number;
    sensor_parametro_id: number | null;
    nivel: string;
    tipo: string;
    mensaje: string;
    valor_detectado: number | null;
    fecha_hora: string;
    estado: string;
    sensor_nombre: string;
    tipo_parametro: string | null;
    resuelta_por?: string | null;
  }
  
  interface ZonaConConteo {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    creado_en: string;
    sensores_count: number;
    sensores: Array<{ id: number; nombre: string }>;
  }
  
  interface InvernaderoDetalle {
    id: number;
    nombre: string;
    descripcion?: string;
    creado_en: string;
    zonas: ZonaConConteo[];
  }
  
  interface ResumenDelete {
    zonasCount: number;
    sensoresCount: number;
    alertasCount: number;
    alertasActivasCount?: number;
  }
  
  @Component({
    selector: 'view-invernadero',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule],
    template: `
      <div *ngIf="!isLoading; else loadingTpl">
      <section
        #snapContainer
        class="w-full h-[100dvh] overflow-y-auto snap-container lg:overflow-y-hidden max-w-full"
        role="region"
        aria-labelledby="titulo-invernadero"
      >
        <!-- BOTÓN CERRAR -->
        <button
          type="button"
          (click)="close.emit()"
          [attr.aria-label]="'Cerrar modal'"
          [attr.title]="'Cerrar modal'"
          class="sticky top-4 float-right mr-4 btn btn-ghost btn-sm z-50 hover:bg-base-200/50"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
  
        <!-- ============== SECCIÓN 1: GENERAL ============== -->
        <section
          id="seccion-general"
          class="snap-section h-full flex flex-col justify-start items-center px-4 lg:px-20"
        >
          <div class="max-w-4xl w-full bg-base-100 rounded-2xl p-8 space-y-6">
            <h2
              id="titulo-invernadero"
              class="text-3xl font-extrabold text-success text-center"
            >
              {{ invernaderoDetalle?.nombre || 'Invernadero' }}
            </h2>
            <p class="text-center text-base-content/80">
              {{ invernaderoDetalle?.descripcion || 'Sin descripción' }}
              <span *ngIf="invernaderoDetalle?.creado_en">
                • Creado en
                {{ invernaderoDetalle?.creado_en | date:'mediumDate':'':'es' }},
                {{ invernaderoDetalle?.creado_en | date:'shortTime':'':'es' }}
              </span>
            </p>
  
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <!-- CARD 1: Zonas -->
              <div class="card bg-base-200 p-6 rounded-2xl shadow flex-1 flex flex-col items-center justify-center min-h-[120px]">
                <!-- Ícono “Pin” -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-7 h-7 text-info"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 2a5 5 0 00-5 5c0 5 5 11 5 11s5-6 5-11a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="mt-2 text-xl font-semibold">
                  {{ resumenDelete?.zonasCount }}
                  Zona{{ resumenDelete?.zonasCount === 1 ? '' : 's' }}
                </span>
                <span class="text-sm text-base-content/60">
                  Activa{{ resumenDelete?.zonasCount === 1 ? '' : 's' }}
                </span>
              </div>
  
              <!-- CARD 2: Sensores -->
              <div class="card bg-base-200 p-6 rounded-2xl shadow flex-1 flex flex-col items-center justify-center min-h-[120px]">
                <!-- Ícono “Termómetro” -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-7 h-7 text-accent"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6 2a4 4 0 118 0v6.278A4.002 4.002 0 0110 14a4 4 0 01-4-4.722V2zm2 0v6a2 2 0 104 0V2a2 2 0 10-4 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="mt-2 text-xl font-semibold">
                  {{ resumenDelete?.sensoresCount }}
                  Sensor{{ resumenDelete?.sensoresCount === 1 ? '' : 'es' }}
                </span>
                <span class="text-sm text-base-content/60">
                  Registrado{{ resumenDelete?.sensoresCount === 1 ? '' : 's' }}
                </span>
              </div>
  
              <!-- CARD 3: Alertas -->
              <div class="card bg-base-200 p-6 rounded-2xl shadow flex-1 flex flex-col items-center justify-center min-h-[120px]">
                <!-- Ícono “Campana” -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-7 h-7 text-error"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 004 15h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm-2 14a2 2 0 104 0H8z"
                  />
                </svg>
                <span class="mt-2 text-xl font-semibold">
                  {{ resumenDelete?.alertasActivasCount || 0 }}
                  Alerta{{ (resumenDelete?.alertasActivasCount || 0) === 1 ? '' : 's' }}
                </span>
                <span class="text-sm text-base-content/60">
                  Activa{{ (resumenDelete?.alertasActivasCount || 0) === 1 ? '' : 's' }}
                </span>
              </div>
            </div>
  
            <div class="bg-base-100 p-6 rounded-lg shadow-md mt-8">
              <h3 class="text-2xl font-bold mb-4">Detalles del Invernadero</h3>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ul class="space-y-2">
                  <li>
                    <span class="font-semibold">ID:</span> {{ invernaderoDetalle?.id ?? '—' }}
                  </li>
                  <li>
                    <span class="font-semibold">Nombre:</span>
                    {{ invernaderoDetalle?.nombre || '—' }}
                  </li>
                  <li>
                    <span class="font-semibold">Descripción:</span>
                    {{ invernaderoDetalle?.descripcion || '—' }}
                  </li>
                </ul>
                <ul class="space-y-2">
                  <li *ngIf="invernaderoDetalle?.creado_en">
                    <span class="font-semibold">Creado en:</span>
                    {{ invernaderoDetalle?.creado_en | date:'mediumDate':'':'es' }},
                    {{ invernaderoDetalle?.creado_en | date:'shortTime':'':'es' }}
                  </li>
                  <li>
                    <span class="font-semibold">Zonas activas:</span>
                    {{ getZonasActivasCount() }}
                  </li>
                  <li>
                    <span class="font-semibold">Sensores activos:</span>
                    {{ getSensoresActivosCount() }}
                  </li>
                </ul>
              </div>
            </div>
  
            <!-- Indicador para pantallas < lg -->
            <div class="mt-8 text-center text-base-content/60 sm:hidden md:block">
              <p>Usa los controles para cambiar de sección →</p>
            </div>
          </div>
        </section>
  
        <!-- ============== SECCIÓN 2: ZONAS ============== -->
        <div id="seccion-zonas" class="snap-section flex justify-center items-start px-4 lg:px-20 py-12">
          <div class="w-full max-w-4xl space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-2xl font-bold">Zonas</h3>
              <button
                type="button"
                class="btn btn-sm btn-outline"
                [class.loading]="isLoadingZonas"
                (click)="recargarZonas()"
                [disabled]="isLoadingZonas"
                [attr.aria-label]="isLoadingZonas ? 'Cargando zonas' : 'Recargar zonas'"
                [attr.title]="isLoadingZonas ? 'Cargando zonas…' : 'Recargar zonas'"
              >
                ↻ Recargar Zonas
              </button>
            </div>
  
            <div class="relative">
              <!-- Tabla Desktop -->
              <table
                *ngIf="!isLoadingZonas && zonasList.length; else tableZonasSkeleton"
                class="table table-xs w-full hidden sm:table"
              >
                <thead class="bg-base-200">
                  <tr>
                    <th class="text-base-content">Nombre</th>
                    <th class="text-base-content">Descripción</th>
                    <th class="text-base-content">Estado</th>
                    <th class="text-base-content"># Sensores</th>
                    <th class="text-base-content">Creado</th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  <tr *ngFor="let z of zonasList; trackBy: trackByZona" role="row">
                    <td class="text-base-content" role="cell">{{ z.nombre }}</td>
                    <td
                      class="text-base-content truncate max-w-xs"
                      [title]="z.descripcion || '—'"
                      role="cell"
                    >
                      {{ z.descripcion || '—' }}
                    </td>
                    <td role="cell">
                      <span
                        [ngClass]="{
                          'badge badge-success': z.activo,
                          'badge badge-ghost': !z.activo
                        }"
                      >
                        {{ z.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="text-base-content" role="cell">{{ z.sensoresCount }}</td>
                    <td class="text-base-content" role="cell">
                      {{ z.creado_en | date:'short':'':'es' }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <ng-template #tableZonasSkeleton>
              <table class="table table-xs w-full hidden sm:table">
                  <tbody>
                    <tr *ngFor="let _ of skeletonArray" class="hover">
                      <td colspan="5">
                        <div class="skeleton h-6 w-full rounded bg-base-300 animate-pulse opacity-60"></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ng-template>
  
              <!-- Sin Zonas -->
              <div
                *ngIf="!zonasList.length && !isLoadingZonas"
                class="text-center py-8 text-base-content/60"
              >
                No hay zonas para este invernadero.
              </div>
  
              <!-- Lista Mobile -->
              <ul
                *ngIf="!isLoadingZonas && zonasList.length; else listZonasSkeleton"
                class="sm:hidden flex flex-col divide-y divide-base-200"
                role="list"
              >
                <li *ngFor="let z of zonasList; trackBy: trackByZona" class="py-4" role="listitem">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="font-medium">{{ z.nombre }}</p>
                      <p class="text-xs text-base-content/60">
                        {{ z.creado_en | date:'short':'':'es' }}
                      </p>
                    </div>
                    <div class="flex items-center gap-2">
                      <span
                        [ngClass]="{
                          'badge badge-success': z.activo,
                          'badge badge-ghost': !z.activo
                        }"
                        class="text-xs"
                      >
                        {{ z.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs"
                        (click)="toggleZonaDetalle(z.id)"
                        [attr.aria-label]="
                          zonaExpandida === z.id
                            ? 'Ocultar detalles de zona'
                            : 'Mostrar detalles de zona'
                        "
                        [attr.title]="
                          zonaExpandida === z.id
                            ? 'Ocultar detalles de zona'
                            : 'Mostrar detalles de zona'
                        "
                      >
                        {{ zonaExpandida === z.id ? 'Ocultar' : 'Ver más' }}
                      </button>
                    </div>
                  </div>
                  <div
                    *ngIf="zonaExpandida === z.id"
                    class="mt-2 bg-base-100 p-3 rounded-lg transition-max-height duration-200 ease-in-out max-h-[30vh] overflow-y-auto"
                  >
                    <p role="document"><strong>Descripción:</strong> {{ z.descripcion || '—' }}</p>
                    <p role="document"><strong>Sensores:</strong> {{ z.sensoresCount }}</p>
                  </div>
                </li>
              </ul>

              <ng-template #listZonasSkeleton>
                <ul class="sm:hidden flex flex-col divide-y divide-base-200" role="list">
                  <li *ngFor="let _ of skeletonArray" class="py-4" role="listitem">
                    <div class="space-y-2">
                      <div class="skeleton h-4 w-3/4 rounded bg-base-300 animate-pulse opacity-60"></div>
                      <div class="skeleton h-4 w-1/2 rounded bg-base-300 animate-pulse opacity-60"></div>
                    </div>
                  </li>
                </ul>
              </ng-template>
  
              <!-- Overlay de carga -->
              <div
                *ngIf="isLoadingZonas"
                class="absolute inset-0 flex items-center justify-center bg-base-100/75"
              >
                <span class="loading loading-spinner loading-xl"></span>
              </div>
            </div>
          </div>
        </div>
  
        <!-- ============== SECCIÓN 3: SENSORES ============== -->
        <div id="seccion-sensores" class="snap-section flex justify-center items-start px-4 lg:px-20 py-12">
          <div class="w-full max-w-4xl space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-2xl font-bold">Sensores</h3>
              <button
                type="button"
                class="btn btn-sm btn-outline"
                [class.loading]="isLoadingSensores"
                (click)="recargarSensores()"
                [disabled]="isLoadingSensores"
                [attr.aria-label]="isLoadingSensores ? 'Cargando sensores' : 'Recargar sensores'"
                [attr.title]="isLoadingSensores ? 'Cargando sensores…' : 'Recargar sensores'"
              >
                ↻ Recargar Sensores
              </button>
            </div>
  
            <div class="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                [(ngModel)]="filtroSensores.nombre"
                placeholder="Buscar por nombre..."
                class="input input-sm input-bordered flex-1"
                [attr.aria-label]="'Buscar sensores por nombre'"
                [disabled]="isLoadingSensores"
              />
              <select
                [(ngModel)]="filtroSensores.estado"
                class="select select-sm select-bordered"
                [attr.aria-label]="'Filtrar sensores por estado'"
                [disabled]="isLoadingSensores"
              >
                <option value="" selected>Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              <button
                type="button"
                class="btn btn-sm"
                [ngClass]="{
                  'btn-outline': !filtroSensores.nombre && !filtroSensores.estado,
                  'btn-primary': filtroSensores.nombre || filtroSensores.estado
                }"
                (click)="recargarSensores()"
                [class.loading]="isLoadingSensores"
                [disabled]="isLoadingSensores"
                [attr.aria-label]="'Aplicar filtro de sensores'"
                [attr.title]="'Aplicar filtro de sensores'"
              >
                Filtrar
              </button>
            </div>
  
            <div class="relative">
              <!-- Tabla Desktop -->
              <table
                *ngIf="!isLoadingSensores && sensoresPage.data.length; else tableSkeleton"
                class="table table-xs w-full hidden sm:table"
              >
                <thead class="bg-base-200 sticky top-0">
                  <tr>
                    <th class="text-base-content">Nombre</th>
                    <th class="text-base-content">Zona</th>
                    <th class="text-base-content">Tipo</th>
                    <th class="text-base-content">Estado</th>
                    <th class="text-base-content">Instalación</th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  <tr *ngFor="let s of sensoresPage.data; trackBy: trackBySensor" role="row">
                    <td class="text-base-content" role="cell">{{ s.nombre }}</td>
                    <td class="text-base-content" role="cell">{{ s.zona?.nombre || '—' }}</td>
                    <td class="text-base-content" role="cell">{{ s.tipo_sensor.nombre }}</td>
                    <td role="cell">
                      <span
                        [ngClass]="{
                          'badge badge-success': s.estado === 'Activo',
                          'badge badge-error': s.estado !== 'Activo'
                        }"
                      >
                        {{ s.estado }}
                      </span>
                    </td>
                    <td class="text-base-content" role="cell">
                      {{ s.fecha_instalacion | date:'short':'':'es' }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <ng-template #tableSkeleton>
                <table class="table table-xs w-full hidden sm:table">
                  <tbody>
                    <tr *ngFor="let _ of skeletonArray" class="hover">
                      <td colspan="5">
                        <div class="skeleton h-6 w-full rounded bg-base-300 animate-pulse opacity-60"></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ng-template>
  
              <!-- Sin Sensores -->
              <div
                *ngIf="!sensoresPage.data.length && !isLoadingSensores"
                class="text-center py-8 text-base-content/60"
              >
                No hay sensores para este invernadero.
              </div>
  
              <!-- Lista Mobile -->
              <ul
                *ngIf="!isLoadingSensores && sensoresPage.data.length; else listSkeleton"
                class="sm:hidden flex flex-col divide-y divide-base-200"
                role="list"
              >
                <li *ngFor="let s of sensoresPage.data; trackBy: trackBySensor" class="py-4" role="listitem">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="font-medium">{{ s.nombre }}</p>
                      <p class="text-xs text-base-content/60">
                        {{ s.zona?.nombre || '—' }}
                      </p>
                      <p class="text-xs">{{ s.tipo_sensor.nombre }}</p>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                      <span
                        [ngClass]="{
                          'badge badge-success': s.estado === 'Activo',
                          'badge badge-error': s.estado !== 'Activo'
                        }"
                        class="text-xs"
                      >
                        {{ s.estado }}
                      </span>
                      <p class="text-xs text-base-content/60">
                        {{ s.fecha_instalacion | date:'short':'':'es' }}
                      </p>
                    </div>
                  </div>
                </li>
              </ul>

              <ng-template #listSkeleton>
                <ul class="sm:hidden flex flex-col divide-y divide-base-200" role="list">
                  <li *ngFor="let _ of skeletonArray" class="py-4" role="listitem">
                    <div class="space-y-2">
                      <div class="skeleton h-4 w-3/4 rounded bg-base-300 animate-pulse opacity-60"></div>
                      <div class="skeleton h-4 w-1/2 rounded bg-base-300 animate-pulse opacity-60"></div>
                    </div>
                  </li>
                </ul>
              </ng-template>
  
              <!-- Overlay de carga -->
              <div
                *ngIf="isLoadingSensores"
                class="absolute inset-0 flex items-center justify-center bg-base-100/75"
              >
                <span class="loading loading-spinner loading-xl"></span>
              </div>
            </div>
  
            <!-- Paginación (si hay datos) -->
            <div
              *ngIf="sensoresPage.data.length"
              class="flex justify-center mt-4 gap-2"
            >
              <button
                type="button"
                class="btn btn-sm btn-outline"
                [disabled]="sensoresPageIndex === 1 || isLoadingSensores"
                (click)="cambiarPagina('sensores', -1)"
                [attr.aria-label]="'Página anterior de sensores'"
                [attr.title]="'Página anterior de sensores'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span class="px-2" aria-live="polite">
                Página {{ sensoresPageIndex }} de {{ totalPagSensores }}
              </span>
              <button
                type="button"
                class="btn btn-sm btn-outline"
                [disabled]="sensoresPageIndex === totalPagSensores || isLoadingSensores"
                (click)="cambiarPagina('sensores', +1)"
                [attr.aria-label]="'Página siguiente de sensores'"
                [attr.title]="'Página siguiente de sensores'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
  
        <!-- ============== SECCIÓN 4: ALERTAS ============== -->
        <div id="seccion-alertas" class="snap-section flex justify-center items-start px-4 lg:px-20 py-12">
          <div class="w-full max-w-4xl space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-2xl font-bold">Alertas Activas</h3>
              <button
                type="button"
                class="btn btn-sm btn-outline"
                [class.loading]="isLoadingAlertas"
                (click)="recargarAlertas()"
                [disabled]="isLoadingAlertas"
                [attr.aria-label]="isLoadingAlertas ? 'Recargando alertas' : 'Recargar alertas'"
                [attr.title]="isLoadingAlertas ? 'Recargando alertas…' : 'Recargar alertas'"
              >
                ↻ Recargar Alertas
              </button>
            </div>
  
            <div class="relative">
              <!-- Tabla Desktop -->
              <table
                *ngIf="!isLoadingAlertas && alertasPage.data.length; else tableAlertasSkeleton"
                class="table table-xs w-full hidden sm:table"
              >
                <thead class="bg-base-200 sticky top-0">
                  <tr>
                    <th class="text-base-content">Sensor</th>
                    <th class="text-base-content">Parámetro</th>
                    <th class="text-base-content">Fecha</th>
                    <th class="text-base-content">Estado</th>
                    <th class="text-base-content">Acción</th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  <tr *ngFor="let a of alertasPage.data; trackBy: trackByAlerta" role="row">
                    <td class="text-base-content" role="cell">{{ a.sensor_nombre }}</td>
                    <td class="text-base-content" role="cell">{{ a.tipo_parametro || '—' }}</td>
                    <td class="text-base-content" role="cell">
                      {{ a.fecha_hora | date:'short':'':'es' }}
                    </td>
                    <td role="cell">
                      <span
                        [ngClass]="{
                          'badge badge-error': a.estado === 'Activa',
                          'badge badge-success': a.estado !== 'Activa'
                        }"
                      >
                        {{ a.estado }}
                      </span>
                    </td>
                    <td role="cell">
                      <button
                        *ngIf="a.estado === 'Activa'"
                        type="button"
                        class="btn btn-xs btn-accent"
                        (click)="resolverAlerta(a.id)"
                        [attr.aria-label]="'Marcar alerta ' + a.id + ' como resuelta'"
                        [attr.title]="'Marcar alerta ' + a.id + ' como resuelta'"
                      >
                        Marcar resuelta
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <ng-template #tableAlertasSkeleton>
                <table class="table table-xs w-full hidden sm:table">
                  <tbody>
                    <tr *ngFor="let _ of skeletonArray" class="hover">
                      <td colspan="5">
                        <div class="skeleton h-6 w-full rounded bg-base-300 animate-pulse opacity-60"></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </ng-template>
  
              <!-- Sin Alertas -->
              <div
                *ngIf="!alertasPage.data.length && !isLoadingAlertas"
                class="text-center py-8 text-base-content/60"
              >
                No hay alertas activas en este invernadero.
              </div>
  
              <!-- Lista Mobile -->
              <ul
                *ngIf="!isLoadingAlertas && alertasPage.data.length; else listAlertasSkeleton"
                class="sm:hidden flex flex-col divide-y divide-base-200"
                role="list"
              >
                <li *ngFor="let a of alertasPage.data; trackBy: trackByAlerta" class="py-4" role="listitem">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="font-medium">{{ a.sensor_nombre }}</p>
                      <p class="text-xs text-base-content/60">
                        {{ a.fecha_hora | date:'short':'':'es' }}
                      </p>
                      <p class="text-xs">{{ a.tipo_parametro || '—' }}</p>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                      <span
                        [ngClass]="{
                          'badge badge-error': a.estado === 'Activa',
                          'badge badge-success': a.estado !== 'Activa'
                        }"
                        class="text-xs"
                      >
                        {{ a.estado }}
                      </span>
                      <button
                        *ngIf="a.estado === 'Activa'"
                        type="button"
                        class="btn btn-xs btn-accent mt-1"
                        (click)="resolverAlerta(a.id)"
                        [attr.aria-label]="'Marcar alerta ' + a.id + ' como resuelta'"
                        [attr.title]="'Marcar alerta ' + a.id + ' como resuelta'"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                </li>
              </ul>

              <ng-template #listAlertasSkeleton>
                <ul class="sm:hidden flex flex-col divide-y divide-base-200" role="list">
                  <li *ngFor="let _ of skeletonArray" class="py-4" role="listitem">
                    <div class="space-y-2">
                      <div class="skeleton h-4 w-3/4 rounded bg-base-300 animate-pulse opacity-60"></div>
                      <div class="skeleton h-4 w-1/2 rounded bg-base-300 animate-pulse opacity-60"></div>
                    </div>
                  </li>
                </ul>
              </ng-template>
  
              <!-- Overlay de carga -->
              <div
                *ngIf="isLoadingAlertas"
                class="absolute inset-0 flex items-center justify-center bg-base-100/75"
              >
                <span class="loading loading-spinner loading-xl"></span>
              </div>
            </div>
  
            <!-- Paginación de Alertas (si hay datos) -->
            <div
              *ngIf="alertasPage.data.length"
              class="flex justify-center mt-4 gap-2"
            >
              <button
                type="button"
                class="btn btn-sm btn-outline"
                [disabled]="alertasPageIndex === 1 || isLoadingAlertas"
                (click)="cambiarPagina('alertas', -1)"
                [attr.aria-label]="'Página anterior de alertas'"
                [attr.title]="'Página anterior de alertas'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span class="px-2" aria-live="polite">
                Página {{ alertasPageIndex }} de {{ totalPagAlertas }}
              </span>
              <button
                type="button"
                class="btn btn-sm btn-outline"
                [disabled]="alertasPageIndex === totalPagAlertas || isLoadingAlertas"
                (click)="cambiarPagina('alertas', +1)"
                [attr.aria-label]="'Página siguiente de alertas'"
                [attr.title]="'Página siguiente de alertas'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
  
      <!-- ======= BOTÓN FLOTANTE (FAB) “Acciones Rápidas” ======= -->
      <button
        type="button"
        class="fab btn btn-primary btn-circle shadow-lg"
        (click)="toggleBottomSheet()"
        [attr.aria-label]="'Acciones rápidas'"
        [attr.title]="'Acciones rápidas'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 5a1 1 0 100 2h14a1 1 0 100-2H3zm0 4a1 1 0 100 2h14a1 1 0 100-2H3zm0 4a1 1 0 100 2h14a1 1 0 100-2H3z" />
        </svg>
      </button>
  
      <!-- ======= BOTTOM SHEET ======= -->
      <div
        *ngIf="isBottomSheetOpen"
        class="bottom-sheet-backdrop"
        (click)="toggleBottomSheet()"
      >
        <div class="bottom-sheet bottom-sheet-open" (click)="$event.stopPropagation()">
          <!-- Handle visual -->
          <div class="w-12 h-1 bg-base-content/30 rounded-full mx-auto mb-4"></div>
          <h4 class="text-lg font-semibold mb-4">Acciones Rápidas</h4>
          <button
            type="button"
            class="btn btn-ghost w-full justify-start mb-2"
            (click)="recargarZonas(); toggleBottomSheet()"
            [attr.aria-label]="'Recargar Zonas'"
            [attr.title]="'Recargar Zonas'"
          >
            ↻ Recargar Zonas
          </button>
          <button
            type="button"
            class="btn btn-ghost w-full justify-start mb-2"
            (click)="recargarSensores(); toggleBottomSheet()"
            [attr.aria-label]="'Recargar Sensores'"
            [attr.title]="'Recargar Sensores'"
          >
            ↻ Recargar Sensores
          </button>
          <button
            type="button"
            class="btn btn-ghost w-full justify-start mb-2"
            (click)="recargarAlertas(); toggleBottomSheet()"
            [attr.aria-label]="'Recargar Alertas'"
            [attr.title]="'Recargar Alertas'"
          >
            ↻ Recargar Alertas
          </button>
          <button
            type="button"
            class="btn btn-ghost w-full justify-start mb-4"
            (click)="resolverTodasAlertas(); toggleBottomSheet()"
            [attr.aria-label]="'Marcar todas alertas resueltas'"
            [attr.title]="'Marcar todas alertas resueltas'"
          >
            ✓ Marcar todas alertas resueltas
          </button>
          <button
            type="button"
            class="btn btn-outline btn-sm w-full"
            (click)="toggleBottomSheet()"
            [attr.aria-label]="'Cerrar acciones rápidas'"
            [attr.title]="'Cerrar acciones rápidas'"
          >
            Cerrar
          </button>
        </div>
      </div>
  
      <!-- ======= NAVEGACIÓN LATERAL (desktop) ======= -->
      <nav class="side-nav" aria-label="Navegación de secciones" role="navigation">
        <!-- BOTÓN “GENERAL” -->
        <button
            type="button"
            (click)="scrollToSection('seccion-general')"
            [ngClass]="{
            'bg-success': activeSnap === 'seccion-general',
            'bg-base-content/20': activeSnap !== 'seccion-general'
            }"
            class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-success"
            [attr.aria-label]="'Ir a sección General'"
            [attr.aria-current]="activeSnap === 'seccion-general' ? 'page' : null"
            title="General"
        >
            <!-- Ícono “Casa” -->
            <svg
            xmlns="http://www.w3.org/2000/svg"
            [ngStyle]="{
                color: activeSnap === 'seccion-general'
                ? 'white'
                : (isDarkMode() ? 'white' : 'black')
            }"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
            >
            <path
                d="M10 2a1 1 0 00-.707.293l-8 8A1 1 0 002 12h2v6a1 1 0 001 1h4a1 1 0 001-1v-4h2v4a1 1 0 001 1h4a1 1 0 001-1v-6h2a1 1 0 00.707-1.707l-8-8A1 1 0 0010 2z"
            />
            </svg>
        </button>

        <!-- BOTÓN “ZONAS” -->
        <button
            type="button"
            (click)="scrollToSection('seccion-zonas')"
            [ngClass]="{
            'bg-success': activeSnap === 'seccion-zonas',
            'bg-base-content/20': activeSnap !== 'seccion-zonas'
            }"
            class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-success"
            [attr.aria-label]="'Ir a sección Zonas'"
            [attr.aria-current]="activeSnap === 'seccion-zonas' ? 'page' : null"
            title="Zonas"
        >
            <!-- Ícono “Pin” -->
            <svg
            xmlns="http://www.w3.org/2000/svg"
            [ngStyle]="{
                color: activeSnap === 'seccion-zonas'
                ? 'white'
                : (isDarkMode() ? 'white' : 'black')
            }"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
            >
            <path
                fill-rule="evenodd"
                d="M10 2a5 5 0 00-5 5c0 5 5 11 5 11s5-6 5-11a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z"
                clip-rule="evenodd"
            />
            </svg>
        </button>

        <!-- BOTÓN “SENSORES” -->
        <button
            type="button"
            (click)="scrollToSection('seccion-sensores')"
            [ngClass]="{
            'bg-success': activeSnap === 'seccion-sensores',
            'bg-base-content/20': activeSnap !== 'seccion-sensores'
            }"
            class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-success"
            [attr.aria-label]="'Ir a sección Sensores'"
            [attr.aria-current]="activeSnap === 'seccion-sensores' ? 'page' : null"
            title="Sensores"
        >
            <!-- Ícono “Termómetro” -->
            <svg
            xmlns="http://www.w3.org/2000/svg"
            [ngStyle]="{
                color: activeSnap === 'seccion-sensores'
                ? 'white'
                : (isDarkMode() ? 'white' : 'black')
            }"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
            >
            <path
                fill-rule="evenodd"
                d="M6 2a4 4 0 118 0v6.278A4.002 4.002 0 0110 14a4 4 0 01-4-4.722V2zm2 0v6a2 2 0 104 0V2a2 2 0 10-4 0z"
                clip-rule="evenodd"
            />
            </svg>
        </button>

        <!-- BOTÓN “ALERTAS” -->
        <button
            type="button"
            (click)="scrollToSection('seccion-alertas')"
            [ngClass]="{
            'bg-success': activeSnap === 'seccion-alertas',
            'bg-base-content/20': activeSnap !== 'seccion-alertas'
            }"
            class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-success"
            [attr.aria-label]="'Ir a sección Alertas'"
            [attr.aria-current]="activeSnap === 'seccion-alertas' ? 'page' : null"
            title="Alertas"
        >
            <!-- Ícono “Campana” -->
            <svg
            xmlns="http://www.w3.org/2000/svg"
            [ngStyle]="{
                color: activeSnap === 'seccion-alertas'
                ? 'white'
                : (isDarkMode() ? 'white' : 'black')
            }"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
            >
            <path
                d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 004 15h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm-2 14a2 2 0 104 0H8z"
            />
            </svg>
        </button>
        </nav>

        <!-- ======= BOTTOM NAV (mobile) ======= -->
        <div class="fixed bottom-4 inset-x-0 z-40 lg:hidden">
          <nav class="mx-auto w-11/12 max-w-md bg-base-200 rounded-full shadow-lg p-2 flex justify-around">
            <!-- GENERAL -->
            <button
              type="button"
              (click)="scrollToSection('seccion-general'); activeSnap = 'seccion-general'"
              [ngClass]="{
                'bg-success': activeSnap === 'seccion-general',
                'bg-base-content/20': activeSnap !== 'seccion-general'
              }"
              class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-success"
              [attr.aria-label]="'Ir a sección General'"
              [attr.aria-current]="activeSnap === 'seccion-general' ? 'page' : null"
              title="General"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                [ngStyle]="{
                  color: activeSnap === 'seccion-general'
                    ? 'white'
                    : (isDarkMode() ? 'white' : 'black')
                }"
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  d="M10 2a1 1 0 00-.707.293l-8 8A1 1 0 002 12h2v6a1 1 0 001 1h4a1 1 0 001-1v-4h2v4a1 1 0 001 1h4a1 1 0 001-1v-6h2a1 1 0 00.707-1.707l-8-8A1 1 0 0010 2z"
                />
              </svg>
            </button>

            <!-- ZONAS -->
            <button
              type="button"
              (click)="scrollToSection('seccion-zonas'); activeSnap = 'seccion-zonas'"
              [ngClass]="{
                'bg-success': activeSnap === 'seccion-zonas',
                'bg-base-content/20': activeSnap !== 'seccion-zonas'
              }"
              class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-success"
              [attr.aria-label]="'Ir a sección Zonas'"
              [attr.aria-current]="activeSnap === 'seccion-zonas' ? 'page' : null"
              title="Zonas"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                [ngStyle]="{
                  color: activeSnap === 'seccion-zonas'
                    ? 'white'
                    : (isDarkMode() ? 'white' : 'black')
                }"
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 2a5 5 0 00-5 5c0 5 5 11 5 11s5-6 5-11a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <!-- SENSORES -->
            <button
              type="button"
              (click)="scrollToSection('seccion-sensores'); activeSnap = 'seccion-sensores'"
              [ngClass]="{
                'bg-success': activeSnap === 'seccion-sensores',
                'bg-base-content/20': activeSnap !== 'seccion-sensores'
              }"
              class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-success"
              [attr.aria-label]="'Ir a sección Sensores'"
              [attr.aria-current]="activeSnap === 'seccion-sensores' ? 'page' : null"
              title="Sensores"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                [ngStyle]="{
                  color: activeSnap === 'seccion-sensores'
                    ? 'white'
                    : (isDarkMode() ? 'white' : 'black')
                }"
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M6 2a4 4 0 118 0v6.278A4.002 4.002 0 0110 14a4 4 0 01-4-4.722V2zm2 0v6a2 2 0 104 0V2a2 2 0 10-4 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <!-- ALERTAS -->
            <button
              type="button"
              (click)="scrollToSection('seccion-alertas'); activeSnap = 'seccion-alertas'"
              [ngClass]="{
                'bg-success': activeSnap === 'seccion-alertas',
                'bg-base-content/20': activeSnap !== 'seccion-alertas'
              }"
              class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-success"
              [attr.aria-label]="'Ir a sección Alertas'"
              [attr.aria-current]="activeSnap === 'seccion-alertas' ? 'page' : null"
              title="Alertas"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                [ngStyle]="{
                  color: activeSnap === 'seccion-alertas'
                    ? 'white'
                    : (isDarkMode() ? 'white' : 'black')
                }"
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 004 15h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm-2 14a2 2 0 104 0H8z"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
      <ng-template #loadingTpl>
        <div class="p-8 text-center">
          <svg class="animate-spin w-8 h-8 text-success mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      </ng-template>
    `,
    styles: [
      `
        /* ================= scroll-snap container y secciones ================= */
        .snap-container {
          scroll-snap-type: y mandatory;
          height: 100vh;
          overflow-y: hidden;      /* Deshabilitar scroll manual */
          scrollbar-width: none;
        }
        .snap-container::-webkit-scrollbar {
          display: none;           /* Oculta scrollbar en Chrome/Safari/Edge */
        }
  
        .snap-section {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
  
        /* ================= Bottom-sheet ================= */
        .bottom-sheet-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 40;
        }
        .bottom-sheet {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: var(--base-200);
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
          min-height: 30vh;
          max-height: 60vh;
          padding: 1rem;
          z-index: 41;
          transform: translateY(100%);
          transition: transform 0.3s ease-in-out;
        }
        .bottom-sheet-open {
          transform: translateY(0);
        }
  
        /* ================= Barra lateral (desktop) ================= */
        .side-nav {
          position: fixed;
          top: 50%;
          right: 1rem;
          transform: translateY(-50%);
          display: none;
          flex-direction: column;
          gap: 0.75rem;
          z-index: 30;
        }
        @media (min-width: 1024px) {
          .side-nav {
            display: flex;
          }
        }
  
        /* ================= FAB ================= */
        .fab {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 60; /* Elevado para que nunca quede cubierto */
        }
  
        /* ================= Pulsación para alertas (opcional) ================= */
        @keyframes pulse-alerta {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        .pulse-alerta {
          animation: pulse-alerta 1.5s ease-in-out infinite;
        }
  
        /* ================= Transición para detalles de zona expandida ================= */
        .transition-max-height {
          overflow: hidden;
        }
        .duration-200 {
          transition-duration: 200ms;
        }
        .ease-in-out {
          transition-timing-function: ease-in-out;
        }
      `
    ]
  })
  export class ViewInvernaderoComponent
    implements OnInit, OnChanges, AfterViewInit, OnDestroy
  {
    @Input() invernaderoId!: number;
    @Output() close = new EventEmitter<void>();
  
    @ViewChild('snapContainer', { static: false, read: ElementRef })
    snapContainer!: ElementRef<HTMLElement>;
  
    public invernaderoDetalle?: InvernaderoDetalle;
    public resumenDelete?: ResumenDelete;
  
    public zonasList: Array<{
      id: number;
      nombre: string;
      descripcion?: string;
      activo: boolean;
      creado_en: string;
      sensoresCount: number;
    }> = [];
  
    public sensoresPage: { data: SensorDetalle[]; total: number } = { data: [], total: 0 };
    public alertasPage: { data: AlertaResumen[]; total: number } = { data: [], total: 0 };
  
    public sensoresPageIndex = 1;
    public sensoresPageSize = 10;
    public totalPagSensores = 1;
    public filtroSensores = { nombre: '', estado: '' };
  
    public alertasPageIndex = 1;
    public alertasPageSize = 10;
    public totalPagAlertas = 1;

    public isLoading = true;

    public isLoadingZonas = false;
    public isLoadingSensores = false;
    public isLoadingAlertas = false;
  
    public zonaExpandida: number | null = null;
  
    // Para scroll-snap (solo puede ser uno de estos valores)
    public activeSnap:
      | 'seccion-general'
      | 'seccion-zonas'
      | 'seccion-sensores'
      | 'seccion-alertas' = 'seccion-general';
  
    private observer?: IntersectionObserver;
  
    // Bottom-sheet
    public isBottomSheetOpen = false;
  
    constructor(
      private invSvc: InvernaderoService,
      private http: HttpClient,
      private alertSvc: AlertService,
      private zonaSvc: ZonaService
    ) {}
  
    ngOnInit() {
      if (this.invernaderoId) {
        this.inicializarDatos();
      }
    }
  
    ngOnChanges(changes: SimpleChanges) {
      if (changes['invernaderoId'] && this.invernaderoId) {
        this.inicializarDatos();
        // Volvemos a la primera sección
        this.scrollToSection('seccion-general');
        this.activeSnap = 'seccion-general';
      }
    }
  
    ngAfterViewInit() {
      if (!this.isLoading) {
        this.setupObserver();
      }
    }

    private setupObserver() {
      if (!this.snapContainer) {
        return;
      }

      if (this.observer) {
        this.observer.disconnect();
      }

      const opciones = {
        root: this.snapContainer.nativeElement,
        rootMargin: '0px',
        threshold: 0.5
      };

      this.observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id') as
              | 'seccion-general'
              | 'seccion-zonas'
              | 'seccion-sensores'
              | 'seccion-alertas';
            if (id) {
              this.activeSnap = id;
              break;
            }
          }
        }
      }, opciones);

      const seccionIds: Array<'seccion-general' | 'seccion-zonas' | 'seccion-sensores' | 'seccion-alertas'> = [
        'seccion-general',
        'seccion-zonas',
        'seccion-sensores',
        'seccion-alertas'
      ];
      seccionIds.forEach((sec) => {
        const el = document.getElementById(sec);
        if (el && this.observer) {
          this.observer.observe(el);
        }
      });
    }
  
    ngOnDestroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
    

    isDarkMode(): boolean {
        return document.documentElement.getAttribute('data-theme') === 'dark';
      }
    /**
     * Desplaza instantáneamente al contenedor snap-container hasta la sección deseada.
     * @param sectionId El id de la sección a la que queremos ir
     */
    scrollToSection(sectionId: string) {
      const container = this.snapContainer.nativeElement;
      const target = document.getElementById(sectionId);
      if (target) {
        const offsetTop = target.offsetTop;
        container.scrollTo({ top: offsetTop, behavior: 'auto' });
      }
    }
  
    /**
     * Alterna la visibilidad del bottom-sheet de acciones.
     */
    toggleBottomSheet() {
      this.isBottomSheetOpen = !this.isBottomSheetOpen;
    }
  
    /**
     * Resuelve todas las alertas activas de este invernadero.
     */
    resolverTodasAlertas() {
      if (!this.alertasPage.data.length) return;
      const ids = this.alertasPage.data.map((a) => a.id);
      const observables = ids.map((id) => this.alertSvc.resolverAlerta(id));
      forkJoin(observables).subscribe({
        next: () => {
          this.recargarAlertas();
          this.invSvc.getAlertasActivasCount(this.invernaderoId).subscribe((resp: { alertasActivasCount: number }) => {
            if (this.resumenDelete) {
              this.resumenDelete.alertasActivasCount = resp.alertasActivasCount;
            }
          });
        },
        error: (err) => console.error('Error al resolver todas las alertas:', err)
      });
    }
  
    private inicializarDatos() {
      this.isLoading = true;
      forkJoin([
        this.cargarDetalleYResumenConAlertasActivas(),
        this.recargarSensores(true),
        this.recargarAlertas(true)
      ])
        .pipe(
          finalize(() => {
            this.isLoading = false;
            // Esperamos a que Angular renderice las secciones
            setTimeout(() => this.setupObserver());
          })
        )
        .subscribe({
          error: (err) => console.error('Error inicializando datos:', err)
        });
    }
  
  
  private cargarDetalleYResumenConAlertasActivas() {
    return forkJoin({
      detalle: this.invSvc.getInvernaderoDetalle(this.invernaderoId),
      resumen: this.invSvc.obtenerResumenEliminacion(this.invernaderoId),
      activas: this.invSvc.getAlertasActivasCount(this.invernaderoId)
    }).pipe(
      tap(({ detalle, resumen, activas }) => {
        this.invernaderoDetalle = {
          id: detalle.id,
          nombre: detalle.nombre,
          descripcion: detalle.descripcion,
          creado_en: detalle.creado_en,
          zonas: detalle.zonas.map((z: any) => ({
            id: z.id,
            nombre: z.nombre,
            descripcion: z.descripcion,
            activo: z.activo,
            creado_en: z.creado_en,
            sensores_count: Array.isArray(z.sensores) ? z.sensores.length : 0,
            sensores: z.sensores
          }))
        } as InvernaderoDetalle;

        this.resumenDelete = {
          zonasCount: resumen.zonasCount,
          sensoresCount: resumen.sensoresCount,
          alertasCount: resumen.alertasCount,
          alertasActivasCount: activas.alertasActivasCount
        };
        this.recargarZonas();
      }),
      catchError((err) => {
        console.error('Error cargando detalle/summary/activas:', err);
        return of(null);
      })
    );
  }
    recargarZonas(asObservable = false) {
      this.isLoadingZonas = true;

      const req$ = this.zonaSvc
        .getZonasByInvernadero(this.invernaderoId)
        .pipe(
          tap((zonas) => {
            this.zonasList = zonas.map((z) => ({
              id: z.id,
              nombre: z.nombre,
              descripcion: z.descripcion,
              activo: z.activo,
              creado_en: z.creado_en,
              sensoresCount: Array.isArray(z.sensores) ? z.sensores.length : 0
            }));
          }),
          catchError((err) => {
            console.error('Error cargando zonas:', err);
            this.zonasList = [];
            return of([]);
          }),
          finalize(() => (this.isLoadingZonas = false))
        );

      return asObservable ? req$ : req$.subscribe();
    }
  
    recargarSensores(asObservable = false) {
      this.isLoadingSensores = true;
      const params = new HttpParams()
        .set('invernadero', this.invernaderoId.toString())
        .set('page', this.sensoresPageIndex.toString())
        .set('pageSize', this.sensoresPageSize.toString())
        .set('search', this.filtroSensores.nombre || '')
        .set('estado', this.filtroSensores.estado || '');
  
      const req$ = this.http
        .get<{ data: SensorDetalle[]; total: number }>(`http://localhost:5000/api/sensores`, { params })
        .pipe(
          tap((resp) => {
            this.sensoresPage.data = resp.data;
            this.sensoresPage.total = resp.total;
            this.totalPagSensores = Math.ceil(resp.total / this.sensoresPageSize);
          }),
          catchError((err) => {
            console.error('Error cargando sensores:', err);
            return of({ data: [], total: 0 });
          }),
          finalize(() => (this.isLoadingSensores = false))
        );

      return asObservable ? req$ : req$.subscribe();
    }
  
    recargarAlertas(asObservable = false) {
      this.isLoadingAlertas = true;
      const params = new HttpParams()
        .set('invernadero_id', this.invernaderoId.toString())
        .set('estado', 'Activa')
        .set('page', this.alertasPageIndex.toString())
        .set('perPage', this.alertasPageSize.toString());
  
      const req$ = this.http
        .get<{
          data: AlertaResumen[];
          pagination: { total: number; pages: number; per_page: number; page: number };
        }>(`http://localhost:5000/api/alertas`, { params })
        .pipe(
          tap((resp) => {
            this.alertasPage.data = resp.data;
            this.alertasPage.total = resp.pagination.total;
            this.totalPagAlertas = resp.pagination.pages;
          }),
          catchError((err) => {
            console.error('Error cargando alertas:', err);
            return of({ data: [], pagination: { total: 0, pages: 0, per_page: 0, page: 0 } });
          }),
          finalize(() => (this.isLoadingAlertas = false))
        );

      return asObservable ? req$ : req$.subscribe();
    }
  
    resolverAlerta(alertaId: number) {
      this.alertSvc.resolverAlerta(alertaId).subscribe({
        next: () => {
          this.recargarAlertas();
          this.invSvc.getAlertasActivasCount(this.invernaderoId).subscribe((resp: { alertasActivasCount: number }) => {
            if (this.resumenDelete) {
              this.resumenDelete.alertasActivasCount = resp.alertasActivasCount;
            }
          });
        },
        error: (err) => console.error('No se pudo resolver la alerta', err)
      });
    }
  
    /**
     * Cambia la página de paginación (sensores o alertas) en ±1.
     */
    cambiarPagina(tipo: 'sensores' | 'alertas', delta: number) {
      if (tipo === 'sensores') {
        const nueva = this.sensoresPageIndex + delta;
        if (nueva >= 1 && nueva <= this.totalPagSensores) {
          this.sensoresPageIndex = nueva;
          this.recargarSensores();
        }
      } else {
        const nueva = this.alertasPageIndex + delta;
        if (nueva >= 1 && nueva <= this.totalPagAlertas) {
          this.alertasPageIndex = nueva;
          this.recargarAlertas();
        }
      }
    }
  
    getZonasActivasCount(): number {
      if (!this.invernaderoDetalle?.zonas) return 0;
      return this.invernaderoDetalle.zonas.filter((z) => z.activo).length;
    }
  
    getSensoresActivosCount(): number {
      if (!this.invernaderoDetalle?.zonas) return 0;
      return this.invernaderoDetalle.zonas
        .filter((z) => z.activo)
        .reduce((sum, z) => sum + (z.sensores?.length ?? 0), 0);
    }
  
    toggleZonaDetalle(zonaId: number) {
      this.zonaExpandida = this.zonaExpandida === zonaId ? null : zonaId;
    }
  
    /**
     * trackBy para listas de zonas (optimiza rendimiento en ngFor).
     */
    trackByZona(index: number, zona: { id: number }): number {
      return zona.id;
    }
  
    /**
     * trackBy para lista de sensores.
     */
    trackBySensor(index: number, s: SensorDetalle): number {
      return s.id;
    }

    get skeletonArray() {
      return Array.from({ length: this.sensoresPageSize });
    }
  
    /**
     * trackBy para lista de alertas.
     */
    trackByAlerta(index: number, a: AlertaResumen): number {
      return a.id;
    }
  }
  