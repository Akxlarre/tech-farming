// src/app/sensores/sensores.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule }           from '@angular/common';
import { timer, Subscription, of, combineLatest }                   from 'rxjs';
import { catchError, exhaustMap, tap }               from 'rxjs/operators';

import {
  SensoresService,
  CrearSensorResponse,
  SensorFilters
} from './sensores.service';
import { TimeSeriesService, BatchLectura }            from './time-series.service';
import { Sensor }                                     from './models/sensor.model';
import { SensorModalService, SensorModalType }                         from './sensor-modal.service';

import { SensorHeaderComponent }      from './components/sensor-header.component';
import { SensorFiltersComponent }     from './components/sensor-filters.component';
import { SensorTableComponent }       from './components/sensor-table.component';
import { SensorModalWrapperComponent }from './components/sensor-modal-wrapper.component';
import { SensorCreateModalComponent }from './components/sensor-create-modal.component';
import { SensorViewModalComponent }  from './components/sensor-view-modal.component';
import { SensorEditModalComponent }  from './components/sensor-edit-modal.component';
import { SensorDeleteModalComponent } from './components/sensor-delete-modal.component';
import { SensorCardComponent } from './components/sensor-card.component';

import { TipoSensorService }         from './tipos_sensor.service';
import { InvernaderoService }        from '../invernaderos/invernaderos.service';
import { ZonaService }               from '../invernaderos/zona.service';
import { TipoSensor }                from './models/tipo-sensor.model';
import { Invernadero, Zona }         from '../invernaderos/models/invernadero.model';

@Component({
  selector: 'app-sensores',
  standalone: true,
  imports: [
    CommonModule,
    SensorHeaderComponent,
    SensorFiltersComponent,
    SensorTableComponent,
    SensorCardComponent,
    SensorModalWrapperComponent,
    SensorCreateModalComponent,
    SensorViewModalComponent,
    SensorEditModalComponent,
    SensorDeleteModalComponent
  ],
  template: `
    <!-- HEADER -->
    <app-sensor-header
      (create)="modal.openModal('create')">
    </app-sensor-header>

    <!-- FILTROS -->
    <app-sensor-filters
      [invernaderos]="invernaderosDisponibles"
      [tiposSensor]="tiposSensores"
      (filter)="onFilter($event)">
    </app-sensor-filters>

    <!-- TABLA + PAGINACIÓN -->
    <section class="space-y-6">
      <div class="hidden md:block">
        <app-sensor-table
          [sensores]="sensoresConLectura"
          (accion)="onAccion($event)"
          [trackByFn]="trackBySensorId">
        </app-sensor-table>
      </div>

      <!-- MOBILE: cards -->
      <div class="block md:hidden space-y-4 p-6">
        <app-sensor-card
          *ngFor="let s of sensoresConLectura; trackBy: trackBySensorId"
          [sensor]="s"
          (accion)="onAccion($event)">
        </app-sensor-card>
      </div>

      <div class="flex items-center justify-between p-6 bg-base-200 rounded-lg">
        <div class="text-sm text-base-content/70">
          Página {{currentPage}} de {{totalPages}} · {{totalSensors}} sensores
        </div>

        <div class="flex items-center gap-2">
          <!-- Primera página -->
          <button class="btn btn-sm btn-outline rounded-full"
                  (click)="goToPage(1)" [disabled]="currentPage === 1">
            «
          </button>

          <!-- Página anterior -->
          <button class="btn btn-sm btn-outline rounded-full"
                  (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
            ‹
          </button>

          <!-- Números -->
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

          <!-- Página siguiente -->
          <button class="btn btn-sm btn-outline rounded-full"
                  (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
            ›
          </button>

          <!-- Última página -->
          <button class="btn btn-sm btn-outline rounded-full"
                  (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages">
            »
          </button>
        </div>
      </div>
    </section>

    <!-- MODALES -->
    <app-sensor-modal-wrapper *ngIf="modal.modalType$ | async as type">
      <ng-container [ngSwitch]="type">
        <!-- CREAR SENSOR -->
        <ng-container *ngSwitchCase="'create'">
          <app-sensor-create-modal
            (saved)="onCreated($event)"
            (close)="onCloseModal()">
          </app-sensor-create-modal>
        </ng-container>

        <!-- VER SENSOR -->
        <ng-container *ngSwitchCase="'view'">
          <ng-container *ngIf="modal.selectedSensor$ | async as sel">
            <app-sensor-view-modal
              [sensor]="sel"
              (close)="onCloseModal()">
            </app-sensor-view-modal>
          </ng-container>
        </ng-container>

        <!-- EDITAR SENSOR -->
        <ng-container *ngSwitchCase="'edit'">
          <ng-container *ngIf="modal.selectedSensor$ | async as sel">
            <app-sensor-edit-modal
              [sensor]="sel"
              (saved)="onEdited($event)"
              (close)="onCloseModal()">
            </app-sensor-edit-modal>
          </ng-container>
        </ng-container>

         <!-- ELIMINAR SENSOR -->
        <ng-container *ngSwitchCase="'delete'">
          <ng-container *ngIf="modal.selectedSensor$ | async as sel">
            <app-sensor-delete-modal
              [sensor]="sel"
              (deleted)="onDeleted($event)"
              (close)="onCloseModal()"
            ></app-sensor-delete-modal>
          </ng-container>
        </ng-container>
      </ng-container>
    </app-sensor-modal-wrapper>
  `
})
export class SensoresComponent implements OnInit, OnDestroy {
  sensoresConLectura: Sensor[] = [];
  refreshSub?: Subscription;
  isDataFullyLoaded = false; 
  // paginación
  pageSize     = 5;
  currentPage  = 1;
  totalSensors = 0;

  // datos para filtros
  tiposSensores:           TipoSensor[]  = [];
  invernaderosDisponibles: Invernadero[] = [];
  zonasDisponibles:        Zona[]        = [];
  appliedFilters:          any           = {};

  constructor(
    private svc: SensoresService,
    private tsSvc: TimeSeriesService,
    private tiposSvc: TipoSensorService,
    private invSvc: InvernaderoService,
    public  modal: SensorModalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // precarga selects
    this.tiposSvc.obtenerTiposSensor()
      .subscribe(list => this.tiposSensores = list);
    // esta funcion puede ser mejorada en el futuro para evitar llamadas innecesarias o porque carga hasta la
    //pagina 100, lo que puede ser excesivo o no suficiente en función de la cantidad de invernaderos
    // y zonas que haya en el sistema.

      this.invSvc.getInvernaderosPage(1, 100).subscribe(resp => { 
        this.invernaderosDisponibles = resp.data;
        this.zonasDisponibles = resp.data.flatMap(inv => inv.zonas || []);
      });
      

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
    this.isDataFullyLoaded = false;
    this.refreshSub = this.svc
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
      )
      .subscribe();
  }

  private updateLecturas() {
    const ids = this.sensoresConLectura.map(s => s.id);
  
    return combineLatest([
      this.tsSvc.getBatchLecturas(ids).pipe(catchError(() => of([]))),
      this.svc.getAlertasActivas(ids).pipe(catchError(() => of([])))
    ]).pipe(
      tap(([lecturas, alertas]) => {
        const alertaMap = new Map(alertas.map(a => [a.id, a.alerta]));
        this.sensoresConLectura.forEach(sensor => {
          sensor.alertaActiva = alertaMap.get(sensor.id) ?? false;
      
          sensor.ultimaLectura = null;
          const item = lecturas.find(l => +l.sensor_id === sensor.id);
          if (item) {
            sensor.ultimaLectura = {
              parametros: item.parametros,
              valores:    item.valores,
              time:       item.time ?? ''
            };
          }
        });
      
        this.isDataFullyLoaded = true;
      })
    );
  }
  

  get paginationItems(): Array<number|string> {
    const total = this.totalPages;
    const cur   = this.currentPage;
    const delta = 1;
    const pages: Array<number|string> = [];
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

  get totalPages(): number {
    return Math.ceil(this.totalSensors / this.pageSize);
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.loadPage(p);
  }

  onAccion(evt: { tipo: SensorModalType; sensor: Sensor }) {
    this.modal.openModal(evt.tipo, evt.sensor);
  }

  onCreated(res: CrearSensorResponse) {
    // aquí manejas solo la creación (token), sin cerrar inmediatamente
  }

 onEdited(updated: Sensor) {
   // refresca la tabla tras guardar edición
    this.modal.closeWithAnimation();
    this.loadPage(this.currentPage);
  }
  
  onDeleted(id: number) {
    this.modal.closeWithAnimation();
    // recarga la página actual para quitar el eliminado
    this.loadPage(this.currentPage);
  }

  onCloseModal() {
    this.modal.closeWithAnimation();
    this.loadPage(this.currentPage);
  }

  trackBySensorId(_i: any, s: Sensor) {
    return s.id;
  }
}
