// src/app/sensores/sensores.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { timer, Subscription, of } from 'rxjs';
import { catchError, exhaustMap, tap } from 'rxjs/operators';

import {
  SensoresService,
  CrearSensorResponse,
  SensorFilters
} from './sensores.service';
import { TimeSeriesService, BatchLectura } from './time-series.service';
import { Sensor } from './models/sensor.model';
import { SensorModalService } from './sensor-modal.service';

import { SensorHeaderComponent }           from './components/sensor-header.component';
import { SensorFiltersComponent }          from './components/sensor-filters.component';
import { SensorTableComponent }            from './components/sensor-table.component';
import { SensorModalWrapperComponent }     from './components/sensor-modal-wrapper.component';
import { SensorCreateModalComponent }      from './components/sensor-create-modal.component';

import { TipoSensorService }       from './tipos_sensor.service';
import { InvernaderoService }      from '../invernaderos/invernaderos.service';
import { ZonaService }             from '../invernaderos/zona.service';
import { TipoSensor }              from './models/tipo-sensor.model';
import { Invernadero, Zona }       from '../invernaderos/models/invernadero.model';

@Component({
  selector: 'app-sensores',
  standalone: true,
  imports: [
    CommonModule,
    SensorHeaderComponent,
    SensorFiltersComponent,
    SensorTableComponent,
    SensorModalWrapperComponent,
    SensorCreateModalComponent
  ],
  template: `
    <!-- HEADER -->
    <app-sensor-header (create)="modal.openModal('create')"></app-sensor-header>

    <!-- FILTROS -->
    <app-sensor-filters
      [invernaderos]="invernaderosDisponibles"
      [tiposSensor]="tiposSensores"
      (filter)="onFilter($event)">
    </app-sensor-filters>

    <!-- TABLA + PAGINACIÓN -->
    <section class="space-y-6">
      <app-sensor-table
        [sensores]="sensoresConLectura"
        (accion)="onAccion($event)"
        [trackByFn]="trackBySensorId">
      </app-sensor-table>

      <div class="flex items-center justify-between p-4 bg-base-200 rounded-lg">
        <div class="text-sm text-gray-600">
          Página {{currentPage}} de {{totalPages}} · {{totalSensors}} sensores
        </div>
        <div class="flex items-center space-x-1">
          <button class="btn btn-md btn-outline rounded-full"
                  (click)="goToPage(1)" [disabled]="currentPage===1">«</button>
          <button class="btn btn-md btn-outline"
                  (click)="goToPage(currentPage-1)" [disabled]="currentPage===1">‹</button>
          <ng-container *ngFor="let item of paginationItems">
            <ng-container *ngIf="item!=='…'; else dot">
              <button class="btn btn-md"
                      [ngClass]="{'btn-primary': item===currentPage, 'btn-outline': item!==currentPage}"
                      (click)="goToPage(+item)" [disabled]="item===currentPage">
                {{ item }}
              </button>
            </ng-container>
            <ng-template #dot><span class="px-2">…</span></ng-template>
          </ng-container>
          <button class="btn btn-md btn-outline"
                  (click)="goToPage(currentPage+1)" [disabled]="currentPage===totalPages">›</button>
          <button class="btn btn-md btn-outline"
                  (click)="goToPage(totalPages)" [disabled]="currentPage===totalPages">»</button>
        </div>
      </div>
    </section>

    <!-- MODALES -->
    <app-sensor-modal-wrapper *ngIf="modal.modalType$ | async as type">
      <ng-container [ngSwitch]="type">
        <app-sensor-create-modal
          *ngSwitchCase="'create'"
          (saved)="onCreated($event)"
          (close)="onCloseModal()">
        </app-sensor-create-modal>
        <!-- otros modales aquí -->
      </ng-container>
    </app-sensor-modal-wrapper>
  `
})
export class SensoresComponent implements OnInit, OnDestroy {
  sensoresConLectura: Sensor[] = [];
  refreshSub?: Subscription;

  // paginación
  pageSize     = 10;
  currentPage  = 1;
  totalSensors = 0;

  // datos para filtros
  tiposSensores:           TipoSensor[]     = [];
  invernaderosDisponibles: Invernadero[]    = [];
  zonasDisponibles:        Zona[]           = [];
  appliedFilters:          any              = {};

  constructor(
    private svc: SensoresService,
    private tsSvc: TimeSeriesService,
    private tiposSvc: TipoSensorService,
    private invSvc: InvernaderoService,
    private zonaSvc: ZonaService,
    public  modal: SensorModalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // cargo los datos de los selects
    this.tiposSvc.obtenerTiposSensor()
      .subscribe(list => this.tiposSensores = list);

    this.invSvc.getInvernaderos()
      .subscribe(list => {
        this.invernaderosDisponibles = list;
        this.zonasDisponibles = list.flatMap(inv => inv.zonas || []);
      });

    // cargo la página inicial
    this.loadPage(1);
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  onFilter(f: SensorFilters) {
    this.appliedFilters = f;
    this.loadPage(1);
  }

  private loadPage(page: number) {
    this.currentPage = page;
    this.refreshSub?.unsubscribe();

    this.svc
      .getSensoresPage(page, this.pageSize, this.appliedFilters)
      .pipe(
        tap(resp => {
          this.sensoresConLectura = resp.data;
          this.totalSensors = resp.total;
        }),
      exhaustMap(() =>
        timer(0, 60000).pipe(
          exhaustMap(() => this.updateLecturas().pipe(catchError(() => of([]))))
        )
      )
    ).subscribe();
  }

  private updateLecturas() {
    const ids = this.sensoresConLectura.map(s => s.id);
    return this.tsSvc.getBatchLecturas(ids).pipe(
      tap(batch => {
        this.sensoresConLectura.forEach(s => s.ultimaLectura = null);
        batch.forEach((item: BatchLectura) => {
          const sensor = this.sensoresConLectura.find(x => x.id === +item.sensor_id);
          if (sensor) {
            sensor.ultimaLectura = {
              parametros: item.parametros,
              valores:     item.valores,
              time:        item.time ?? ''
            };
          }
        });
      })
    );
  }

  get paginationItems(): Array<number|string> {
    const total = this.totalPages;
    const cur   = this.currentPage;
    const delta = 1;
    const r: Array<number|string> = [];
    let last = 0;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= cur - delta && i <= cur + delta)) {
        if (last && i - last > 1) r.push('…');
        r.push(i);
        last = i;
      }
    }
    return r;
  }

  get totalPages(): number {
    return Math.ceil(this.totalSensors / this.pageSize);
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.loadPage(p);
  }

  onAccion(evt: { tipo: string; sensor: Sensor }) {
    // por ejemplo: this.modal.openModal('view', evt.sensor);
  }

  onCreated(res: CrearSensorResponse) {
    // se muestra la instrucción en el modal
  }

  onCloseModal() {
    this.modal.closeWithAnimation();
    this.loadPage(this.currentPage);
  }

  trackBySensorId(_i: any, s: Sensor) {
    return s.id;
  }
}
