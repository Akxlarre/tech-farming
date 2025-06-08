import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlertService, Alerta } from './alertas.service';
import { UmbralModalService } from './umbral-modal.service';
import { AlertsHeaderComponent } from './components/alertas-header.component';
import { ActiveAlertsComponent } from './components/alertas-activas.component';
import { AlertsHistoryComponent } from './components/alertas-historial.component';
import { UmbralModalWrapperComponent } from './components/umbral-modal-wrapper.component';
import { UmbralConfigModalComponent } from './components/umbral-config-modal.component';
import { HistorialService } from '../historial/historial.service';
import { InvernaderoService } from '../invernaderos/invernaderos.service';
import { ZonaService } from '../invernaderos/zona.service';
import { Invernadero, Zona } from '../invernaderos/models/invernadero.model';
import { Sensor } from '../sensores/models/sensor.model';
import { UmbralListComponent } from './components/umbral-list.component';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlertsHeaderComponent,
    ActiveAlertsComponent,
    AlertsHistoryComponent,
    UmbralConfigModalComponent,
    UmbralListComponent,
    UmbralModalWrapperComponent
  ],
  template: `
    <!-- Header -->
    <app-alertas-header
      (configurar)="abrirConfiguracionUmbrales()">
    </app-alertas-header>

    <!-- Contenido principal -->
    <div class="flex items-center gap-2 mb-4 px-6 text-basetext">
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5 text-basetext"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
      >
        <path stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L14 
                 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 018 
                 17v-3.586L3.293 6.707A1 1 0 013 6V4z"
        />
      </svg>
      <h3 class="text-lg font-medium">Filtros</h3>
    </div>

    <div class="bg-base-200 px-6 rounded-xl mb-6">
      <!-- Filtros -->
      <form [formGroup]="filterForm" (ngSubmit)="aplicarFiltros()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6 items-end">
        <!-- Nivel -->
        <div>
          <label class="label-basetext font-bold"><span class="label-text">Nivel</span></label>
          <select class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500" 
                  formControlName="nivel">
            <option value="">Todos</option>
            <option value="Advertencia">Advertencia</option>
            <option value="Crítico">Crítico</option>
          </select>
        </div>

        <!-- Invernadero -->
        <div>
          <label class="label-basetext font-bold"><span class="label-text">Invernadero</span></label>
          <select class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500" 
                  formControlName="invernadero" >
            <option value="">Todos los invernaderos</option>
            <option *ngFor="let inv of invernaderos" [value]="inv.id">{{ inv.nombre }}</option>
          </select>
        </div>

        <!-- Zona -->
        <div>
          <label class="label-basetext font-bold"><span class="label-text">Zona</span></label>
          <select formControlName="zona"
                  class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500
                  disabled:bg-base-200 disabled:text-base-content/50 disabled:border-base-300 disabled:cursor-not-allowed"
                  [disabled]="!filterForm.get('invernadero')?.value"
                  [attr.title]="!filterForm.get('invernadero')?.value ? 'Selecciona un invernadero primero' : null">
            <option value="" *ngIf="!filterForm.get('invernadero')?.value">
              Selecciona un invernadero primero
            </option>
            <option value="" *ngIf="filterForm.get('invernadero')?.value && cargandoZonas">
              Cargando zonas...
            </option>
            <option value="" *ngIf="filterForm.get('invernadero')?.value && !cargandoZonas && zonas.length === 0">
              No hay zonas disponibles
            </option>
            <option value="" *ngIf="filterForm.get('invernadero')?.value && !cargandoZonas && zonas.length > 0">
              Todas las zonas
            </option>
            <option *ngFor="let z of zonas" [value]="z.id">{{ z.nombre }}</option>
          </select>
        </div>

        <!-- Sensor -->
        <div>
          <label class="label-basetext font-bold"><span class="label-text">Sensor</span></label>
          <select formControlName="sensor"
                  class="select select-bordered rounded-lg w-full focus:ring focus:ring-green-500
                  disabled:bg-base-200 disabled:text-base-content/50 disabled:border-base-300 disabled:cursor-not-allowed"
                  [disabled]="!filterForm.get('invernadero')?.value || !filterForm.get('zona')?.value"
                  [attr.title]="!filterForm.get('invernadero')?.value || !filterForm.get('zona')?.value ? 'Selecciona invernadero y zona' : null">
            <option value="" *ngIf="!filterForm.get('zona')?.value">
              Selecciona invernadero y zona
            </option>
            <option value="" *ngIf="filterForm.get('zona')?.value && cargandoSensores">
              Cargando sensores...
            </option>
            <option value="" *ngIf="filterForm.get('zona')?.value && !cargandoSensores && sensores.length === 0">
              No hay sensores disponibles
            </option>
            <option value="" *ngIf="filterForm.get('zona')?.value && !cargandoSensores && sensores.length > 0">
              Todos los sensores
            </option>
            <option *ngFor="let s of sensores" [value]="s.id">{{ s.nombre }}</option>
          </select>
        </div>

        <!-- Botón aplicar -->
        <div class="flex justify-end md:justify-start">
          <button class="btn btn-outline btn-md h-12 w-full md:w-auto border-success text-base-content hover:bg-success hover:text-base-content transition-colors duration-200" type="submit">Aplicar</button>
        </div>
      </form>

      <!-- Chips + botón limpiar -->
      <div class="flex flex-wrap gap-2 mb-6" *ngIf="filtrosActivos().length > 0">
        <span *ngFor="let chip of filtrosActivos()" class="badge badge-outline badge-primary flex items-center">
          {{ chip.label }}
        </span>
        <button class="btn btn-sm btn-ghost ml-2" (click)="limpiarFiltros()">Limpiar todo</button>
      </div>

      <!-- Tabs + botón -->
      <div class="flex justify-between items-center mb-4">
        <div class="tabs text-base-content font-bold">
          <a class="tab tab-lg" [class.tab-active]="tabIndex === 0" (click)="cambiarTab(0)">Activas</a>
          <a class="tab tab-lg" [class.tab-active]="tabIndex === 1" (click)="cambiarTab(1)">Resueltas</a>
        </div>
      </div>

      <!-- Contenido de cada tab -->
      <div *ngIf="tabIndex === 0" class="mt-4">
        <app-active-alerts [alertas]="alertasActivas" [resolviendoId]="resolviendoId" (resolver)="resolverAlerta($event)"></app-active-alerts>
      </div>
      <div *ngIf="tabIndex === 1" class="mt-4">
        <app-alerts-history [alertas]="alertasResueltas"></app-alerts-history>
      </div>

      <!-- Modal de configuración de Umbrales -->
      <app-umbral-modal-wrapper *ngIf="modal.modalType$ | async as tipo">
        <app-umbral-list *ngIf="tipo === 'view'"></app-umbral-list>
        <app-umbral-config-modal *ngIf="tipo === 'create' || tipo === 'edit'"></app-umbral-config-modal>
      </app-umbral-modal-wrapper>
    </div>

    <div *ngIf="mostrarModalExito"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-xl shadow-xl text-center w-[300px] space-y-2">
      <h3 class="text-xl font-semibold text-green-600">
        ✅ ¡Éxito!
      </h3>
      <p>La alerta fue marcada como resuelta exitosamente.</p>
    </div>
  </div>

  <!-- Paginación -->
  <div class="flex items-center justify-between p-6 bg-base-200 rounded-lg">
    <div class="text-sm text-base-content/70">
      Página {{currentPage}} de {{totalPages}} · {{totalAlertas}} alertas
    </div>

    <div class="flex items-center gap-2">
      <button class="btn btn-sm btn-outline rounded-full" (click)="goToPage(1)" [disabled]="currentPage === 1">«</button>
      <button class="btn btn-sm btn-outline rounded-full" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">‹</button>

      <ng-container *ngFor="let item of paginationItems">
        <ng-container *ngIf="item !== '…'; else dots">
          <button
            class="btn btn-sm rounded-full"
            [ngClass]="{
              'btn-success text-base-content border-success cursor-default': item === currentPage,
              'btn-outline': item !== currentPage
            }"
            (click)="goToPage(+item)" [disabled]="item === currentPage"
          >
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
  
  `
})
export class AlertasComponent implements OnInit, OnDestroy {
  nivelControl = new FormControl<'Advertencia' | 'Crítico' | null>(null);
  invernaderoControl = new FormControl<number | null>(null);
  zonaControl = new FormControl<number | null>(null);
  busquedaControl = new FormControl<string | null>(null);
  filterForm!: FormGroup;
  cargandoZonas = false;
  cargandoSensores = false;
  mostrarModalExito = false;
  resolviendoId: number | null = null;

  invernaderos: Invernadero[] = [];
  zonas: Zona[] = [];
  sensores: Sensor[] = [];
  alertasActivas: Alerta[] = [];
  alertasResueltas: Alerta[] = [];
  tabIndex = 0;
  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  totalAlertas = 0;
  private invSub?: Subscription;
  private zonaSub?: Subscription;

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private histSvc: HistorialService,
    private invSvc: InvernaderoService,
    private zonaSvc: ZonaService,
    public modal: UmbralModalService
  ) { }

  ngOnInit() {
    this.filterForm = this.fb.group({
      nivel: [''],
      invernadero: [''],
      zona: [''],
      sensor: ['']
    });

    this.filterForm.get('zona')!.disable({ emitEvent: false });
    this.filterForm.get('sensor')!.disable({ emitEvent: false });

    this.invSub = this.filterForm.get('invernadero')!.valueChanges.subscribe(invId => {
      const zonaCtrl = this.filterForm.get('zona')!;
      const sensorCtrl = this.filterForm.get('sensor')!;
      zonaCtrl.reset(); zonaCtrl.disable();
      sensorCtrl.reset(); sensorCtrl.disable();
      this.zonas = []; this.sensores = [];

      if (invId) {
        zonaCtrl.enable();
        this.cargandoZonas = true;
        this.zonaSvc.getZonasByInvernadero(invId).subscribe(zs => {
          this.zonas = zs;
          this.cargandoZonas = false;
        });
      }
    });

    this.zonaSub = this.filterForm.get('zona')!.valueChanges.subscribe(zonaId => {
      const sensorCtrl = this.filterForm.get('sensor')!;
      sensorCtrl.reset(); sensorCtrl.disable();
      this.sensores = [];

      if (zonaId) {
        this.cargandoSensores = true;
        this.histSvc.getSensoresByZona(zonaId).subscribe(ss => {
          this.sensores = ss;
          sensorCtrl.enable();
          this.cargandoSensores = false;
        });
      }
    });

    this.cargarInvernaderos();
    this.cargarAlertas();
  }

  cargarInvernaderos() {
    this.invSvc.getInvernaderos().subscribe(list => {
      this.invernaderos = list;
    });
  }

  aplicarFiltros() {
    const f = this.filterForm.getRawValue();
    const estado = this.tabIndex === 0 ? 'Activa' : 'Resuelta';

    this.alertService.getAlertas(
      estado,
      f.nivel || undefined,
      f.invernadero || undefined,
      f.zona || undefined,
      f.sensor || undefined
    ).subscribe(resp => {
      if (estado === 'Activa') this.alertasActivas = resp.data;
      else this.alertasResueltas = resp.data;
    });
  }

  limpiarFiltros() {
    this.filterForm.reset({
      nivel: '',
      invernadero: '',
      zona: '',
      sensor: ''
    });

    this.zonas = [];
    this.sensores = [];
    this.filterForm.get('zona')!.disable({ emitEvent: false });
    this.filterForm.get('sensor')!.disable({ emitEvent: false });

    const estado = this.tabIndex === 0 ? 'Activa' : 'Resuelta';
    this.alertService.getAlertas(estado)
      .subscribe(resp => {
        if (estado === 'Activa') this.alertasActivas = resp.data;
        else this.alertasResueltas = resp.data;
      });
  }

  filtrosActivos(): Array<{ key: string; label: string }> {
    const v = this.filterForm.getRawValue();
    const chips: Array<{ key: string; label: string }> = [];

    const labelMap: Record<string, string> = {
      nivel: 'Nivel',
      invernadero: 'Invernadero',
      zona: 'Zona',
      sensor: 'Sensor'
    };

    for (const key of Object.keys(v)) {
      const val = v[key as keyof typeof v];
      if (!val || val === '') continue;

      let displayValue = val;

      if (key === 'invernadero') {
        const inv = this.invernaderos.find(i => i.id === +val);
        displayValue = inv?.nombre ?? val;
      }

      if (key === 'zona') {
        const z = this.zonas.find(z => z.id === +val);
        displayValue = z?.nombre ?? val;
      }

      if (key === 'sensor') {
        const s = this.sensores.find(s => s.id === +val);
        displayValue = s?.nombre ?? val;
      }

      chips.push({ key, label: `${labelMap[key]}: ${displayValue}` });
    }

    return chips;
  }

  cargarAlertas() {
    const estado = this.tabIndex === 0 ? 'Activa' : 'Resuelta';
    const f = this.filterForm.getRawValue();

    this.alertService.getAlertas(
      estado,
      f.nivel || undefined,
      f.invernadero || undefined,
      f.zona || undefined,
      f.sensor || undefined,
      this.currentPage,
      this.pageSize
    ).subscribe(resp => {
      if (estado === 'Activa') {
        this.alertasActivas = resp.data;
      } else {
        this.alertasResueltas = resp.data;
      }

      this.totalPages = resp.pagination.pages;
      this.totalAlertas = resp.pagination.total;
    });
  }

  cargarAmbasListas() {
    const f = this.filterForm.getRawValue();

    this.alertService.getAlertas('Activa', f.nivel, f.invernadero, f.zona, f.sensor)
      .subscribe(resp => this.alertasActivas = resp.data);

    this.alertService.getAlertas('Resuelta', f.nivel, f.invernadero, f.zona, f.sensor)
      .subscribe(resp => this.alertasResueltas = resp.data);
  }

  get paginationItems(): Array<number | string> {
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

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.cargarAlertas();
  }

  cambiarTab(index: number) {
    this.tabIndex = index;
    this.cargarAlertas();
  }

  resolverAlerta(alerta: Alerta) {
    this.resolviendoId = alerta.id;

    this.alertService.resolverAlerta(alerta.id).subscribe(() => {
      this.cargarAmbasListas();
      this.resolviendoId = null;
      this.mostrarModalExito = true;

      setTimeout(() => (this.mostrarModalExito = false), 2500);
    }, () => {
      this.resolviendoId = null;
    });
  }
  abrirConfiguracionUmbrales() {
    this.modal.openModal('view');
  }

  ngOnDestroy(): void {
    this.invSub?.unsubscribe();
    this.zonaSub?.unsubscribe();
  }
}
