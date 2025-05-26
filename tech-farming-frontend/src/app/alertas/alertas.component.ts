// src/app/alertas/alertas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AlertService, Alerta } from './alertas.service';
import { UmbralModalService } from './umbral-modal.service';
import { ActiveAlertsComponent } from './components/alertas-activas.component';
import { AlertsHistoryComponent } from './components/alertas-historial.component';
import { UmbralModalWrapperComponent } from './components/umbral-modal-wrapper.component';
import { UmbralConfigModalComponent } from './components/umbral-config-modal.component';
import { Invernadero, Zona } from '../models/index';
import { UmbralListComponent } from './components/umbral-list.component';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActiveAlertsComponent,
    AlertsHistoryComponent,
    UmbralConfigModalComponent,
    UmbralListComponent,
    UmbralModalWrapperComponent
],
  template: `
    <div class="p-6 bg-base-100">
      <h1 class="text-3xl font-bold mb-6">Gestión de Alertas</h1>

      <!-- Filtros -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <label class="label"><span class="label-text">Estado</span></label>
          <select class="select select-bordered w-full" [formControl]="estadoControl">
            <option value="activo">Activo</option>
            <option value="historico">Histórico</option>
          </select>
        </div>
        <div>
          <label class="label"><span class="label-text">Nivel</span></label>
          <select class="select select-bordered w-full" [formControl]="nivelControl">
            <option value="advertencia">Advertencia</option>
            <option value="critico">Crítico</option>
          </select>
        </div>
        <div>
          <label class="label"><span class="label-text">Invernadero</span></label>
          <select class="select select-bordered w-full" [formControl]="invernaderoControl" (change)="onInvernaderoChange()">
            <option *ngFor="let inv of invernaderos" [value]="inv.id">{{ inv.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="label"><span class="label-text">Zona</span></label>
          <select class="select select-bordered w-full" [formControl]="zonaControl">
            <option *ngFor="let z of zonas" [value]="z.id">{{ z.nombre }}</option>
          </select>
        </div>
        <div class="col-span-1 sm:col-span-2 lg:col-span-1">
          <label class="label"><span class="label-text">Buscar</span></label>
          <input
            type="text"
            class="input input-bordered w-full"
            placeholder="Texto libre"
            [formControl]="busquedaControl"
          />
        </div>
      </div>

      <div class="flex gap-4 mb-8">
        <button class="btn btn-primary" (click)="cargarAlertas()">Aplicar filtros</button>
        <button class="btn btn-outline" (click)="abrirConfiguracionUmbrales()">Configurar Umbrales</button>
      </div>

      <!-- Pestañas DaisyUI -->
      <div class="tabs">
        <a
          class="tab tab-lg"
          [class.tab-active]="tabIndex === 0"
          (click)="tabIndex = 0"
        >Activas</a>
        <a
          class="tab tab-lg"
          [class.tab-active]="tabIndex === 1"
          (click)="tabIndex = 1"
        >Histórico</a>
      </div>

      <div *ngIf="tabIndex === 0" class="mt-4">
        <app-active-alerts [alertas]="alertas" (resolver)="resolverAlerta($event)"></app-active-alerts>
      </div>
      <div *ngIf="tabIndex === 1" class="mt-4">
        <app-alerts-history [alertas]="alertas"></app-alerts-history>
      </div>

      <!-- Modal de configuración de Umbrales -->
      <app-umbral-modal-wrapper *ngIf="modal.modalType$ | async as tipo">
        <!-- 1) Lista de umbrales -->
        <app-umbral-list *ngIf="tipo === 'view'"></app-umbral-list>
        <!-- 2) Formulario de Crear/Editar -->
        <app-umbral-config-modal 
            *ngIf="tipo === 'create' || tipo === 'edit'">
        </app-umbral-config-modal>
      </app-umbral-modal-wrapper>
    </div>
  `
})
export class AlertasComponent implements OnInit {
  estadoControl = new FormControl<'activo' | 'historico'>('activo', { nonNullable: true });
  nivelControl = new FormControl<'advertencia' | 'critico' | null>(null);
  invernaderoControl = new FormControl<number | null>(null);
  zonaControl = new FormControl<number | null>(null);
  busquedaControl = new FormControl<string | null>(null);

  invernaderos: Invernadero[] = [];
  zonas: Zona[] = [];
  alertas: Alerta[] = [];
  tabIndex = 0;

  constructor(
    private alertService: AlertService,
    public modal: UmbralModalService
  ) {}

  ngOnInit() {
    this.cargarInvernaderos();
    this.cargarAlertas();
  }

  cargarInvernaderos() {
    // TODO
  }

  onInvernaderoChange() {
    // TODO
  }

  cargarAlertas() {
    const estado = this.estadoControl.value;
    const nivel = this.nivelControl.value ?? undefined;
    const invernaderoId = this.invernaderoControl.value ?? undefined;
    const zonaId = this.zonaControl.value ?? undefined;
    const busqueda = this.busquedaControl.value ?? undefined;
    this.alertService.getAlertas(estado, nivel, invernaderoId, zonaId, busqueda)
      .subscribe(resp => this.alertas = resp.data);
  }

  resolverAlerta(alerta: Alerta) {
    this.alertService.resolverAlerta(alerta.id).subscribe(() => this.cargarAlertas());
  }

  abrirConfiguracionUmbrales() {
    this.modal.openModal('view');
  }
}
