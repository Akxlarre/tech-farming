// src/app/historial/filtro/filtro.component.ts

import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { HistorialService } from '../historial.service';
import {
  Invernadero,
  Zona,
  Sensor,
  TipoParametro,
  HistorialParams
} from '../../models';
import { filter, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filtro-global',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <form [formGroup]="form" class="p-6 bg-base-200 rounded-lg space-y-6">

      <!-- ================================================= -->
      <!-- FILTROS, PRIMERA FILA: Invernadero | Zona | Sensor | Parámetro -->
      <!-- ================================================= -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <!-- Invernadero -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Invernadero</span>
          </label>
          <select
            formControlName="invernaderoId"
            class="select select-bordered w-full bg-base-100"
          >
            <option [ngValue]="null" disabled>— Selecciona —</option>
            <option *ngFor="let inv of invernaderos" [value]="inv.id">
              {{ inv.nombre }}
            </option>
          </select>
          <!-- Reservamos altura con h-5; el texto solo aparece cuando hay error -->
          <p class="text-red-600 text-sm mt-1 h-5 overflow-hidden">
            <ng-container *ngIf="
              form.get('invernaderoId')?.touched &&
              form.get('invernaderoId')?.hasError('required')
            ">
              Debes elegir un invernadero
            </ng-container>
          </p>
        </div>

        <!-- Zona -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Zona</span>
          </label>
          <select
            formControlName="zonaId"
            [disabled]="zonas.length === 0"
            class="select select-bordered w-full bg-base-100"
          >
            <option [ngValue]="null" disabled>— Selecciona —</option>
            <option *ngFor="let z of zonas" [value]="z.id">
              {{ z.nombre }}
            </option>
          </select>
          <p class="text-red-600 text-sm mt-1 h-5 overflow-hidden">
            <ng-container *ngIf="
              form.get('zonaId')?.touched &&
              form.get('zonaId')?.hasError('required')
            ">
              Debes elegir una zona
            </ng-container>
          </p>
        </div>

        <!-- Sensor -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Sensor</span>
          </label>
          <select
            formControlName="sensorId"
            [disabled]="sensores.length === 0"
            class="select select-bordered w-full bg-base-100"
          >
            <option [ngValue]="null" disabled>— Selecciona —</option>
            <option *ngFor="let s of sensores" [value]="s.id">
              {{ s.nombre }}
            </option>
          </select>
          <p class="text-red-600 text-sm mt-1 h-5 overflow-hidden">
            <ng-container *ngIf="
              form.get('sensorId')?.touched &&
              form.get('sensorId')?.hasError('required')
            ">
              Debes elegir un sensor
            </ng-container>
          </p>
        </div>

        <!-- Parámetro -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Parámetro</span>
          </label>
          <select
            formControlName="tipoParametroId"
            class="select select-bordered w-full bg-base-100"
          >
            <option [ngValue]="null" disabled>— Selecciona —</option>
            <option *ngFor="let t of tiposParametro" [value]="t.id">
              {{ t.nombre }}
            </option>
          </select>
          <p class="text-red-600 text-sm mt-1 h-5 overflow-hidden">
            <ng-container *ngIf="
              form.get('tipoParametroId')?.touched &&
              form.get('tipoParametroId')?.hasError('required')
            ">
              Debes elegir un parámetro
            </ng-container>
          </p>
        </div>
      </div>

      <!-- ================================================= -->
      <!-- SEGUNDA FILA: Desde | Hasta | (VACÍO) | Botón Aplicar -->
      <!-- ================================================= -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 items-end">
        <!-- Fecha “Desde” -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Desde</span>
          </label>
          <input
            type="date"
            formControlName="desde"
            class="input input-bordered w-full bg-base-100"
          />
          <p class="text-red-600 text-sm mt-1 h-5 overflow-hidden">
            <ng-container *ngIf="
              form.get('desde')?.touched &&
              form.get('desde')?.hasError('required')
            ">
              Fecha “Desde” obligatoria
            </ng-container>
          </p>
        </div>

        <!-- Fecha “Hasta” -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Hasta</span>
          </label>
          <input
            type="date"
            formControlName="hasta"
            class="input input-bordered w-full bg-base-100"
          />
          <p class="text-red-600 text-sm mt-1 h-5 overflow-hidden">
            <ng-container *ngIf="
              form.get('hasta')?.touched &&
              form.get('hasta')?.hasError('required')
            ">
              Fecha “Hasta” obligatoria
            </ng-container>
          </p>
        </div>

        <!-- Celda vacía para mantener la cuadrícula equilibrada -->
        <div></div>

        <!-- Botón “Aplicar filtros” alineado a derecha -->
        <div class="flex lg:justify-end sm:justify-start">
          <button
            type="button"
            class="btn btn-outline btn-sm h-10 w-full sm:w-auto border-success text-base-content hover:bg-success hover:text-base-content transition-colors duration-200"
            (click)="aplicarFiltros()"
            [disabled]="form.invalid"
          >
            Aplicar filtros
          </button>
        </div>
      </div>

      <!-- Mensaje de validación de rango -->
      <div *ngIf="form.hasError('rangoInvalido')" class="text-red-600 text-sm">
        La fecha “Desde” no puede ser posterior a “Hasta”.
      </div>
    </form>
  `,
  styles: [`
    :host { display: block; }
    .form-control { display: flex; flex-direction: column; }
    .label-text { font-weight: 600; }
  `]
})
export class FiltroComponent implements OnInit, OnDestroy {
  /** Listas que llenamos desde el servicio */
  invernaderos:   Invernadero[]   = [];
  zonas:          Zona[]          = [];
  sensores:       Sensor[]        = [];
  tiposParametro: TipoParametro[] = [];

  /** FormGroup que contiene todos los filtros */
  form!: FormGroup;
  private invSub?: Subscription;
  private zonaSub?: Subscription;

  /** Emitimos el objeto completo de filtros cuando el usuario pulsa “Aplicar” */
  @Output() filtrosSubmit = new EventEmitter<HistorialParams>();

  constructor(private historialService: HistorialService) {}

  private invLoaded = false;
  private paramLoaded = false;
  private defaultsApplied = false;

  ngOnInit() {
    // 1) Inicializamos el FormGroup con validadores:
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    this.form = new FormGroup({
      invernaderoId:   new FormControl<number | null>(null, Validators.required),
      zonaId:          new FormControl<number | null>(null),
      sensorId:        new FormControl<number | null>(null),
      tipoParametroId: new FormControl<number | null>(null, Validators.required),
      desde:           new FormControl<string>(this.formatDate(yesterday), Validators.required),
      hasta:           new FormControl<string>(this.formatDate(today), Validators.required)
    }, { validators: this.rangoValidator() });

    // 2) Cargar Invernaderos y parámetros básicos
    this.historialService.getInvernaderos().subscribe(list => {
      this.invernaderos = list;
      if (list.length > 0) {
        // Seleccionamos por defecto el primero
        this.form.get('invernaderoId')!.setValue(list[0].id);
      }
      this.invLoaded = true;
      this.tryAutoApply();
    });

    this.historialService.getTiposParametro().subscribe(list => {
      this.tiposParametro = list;
      if (list.length > 0) {
        // Seleccionamos por defecto el primero
        this.form.get('tipoParametroId')!.setValue(list[0].id);
      }
      this.paramLoaded = true;
      this.tryAutoApply();
    });

    // 3) Suscripción a cambios en invernadero → cargar Zonas
    this.invSub = this.form.get('invernaderoId')!
      .valueChanges
      .pipe(
        filter(id => id != null),
        switchMap((invId: number) => {
          // Limpiamos controles dependientes
          this.form.get('zonaId')!.reset();
          this.zonas = [];
          this.form.get('sensorId')!.reset();
          this.sensores = [];
          // Pedimos las zonas correspondientes
          return this.historialService.getZonasByInvernadero(invId);
        })
      )
      .subscribe(list => {
        this.zonas = list;
        if (list.length === 1) {
          // Si sólo hay una zona, auto-seleccionamos
          this.form.get('zonaId')!.setValue(list[0].id);
        }
      });

    // 4) Suscripción a cambios en zona → cargar Sensores
    this.zonaSub = this.form.get('zonaId')!
      .valueChanges
      .pipe(
        filter(id => id != null),
        switchMap((zonaId: number) => {
          this.form.get('sensorId')!.reset();
          this.sensores = [];
          return this.historialService.getSensoresByZona(zonaId);
        })
      )
      .subscribe(list => {
        this.sensores = list;
        if (list.length === 1) {
          // Si sólo hay un sensor, auto-seleccionamos
          this.form.get('sensorId')!.setValue(list[0].id);
        }
      });
  }

  /**
   * Validador personalizado para asegurarse de que “desde <= hasta”.
   */
  private rangoValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const desdeStr = group.get('desde')!.value as string;
      const hastaStr = group.get('hasta')!.value as string;
      if (desdeStr && hastaStr) {
        const desde = new Date(desdeStr);
        const hasta = new Date(hastaStr);
        if (desde > hasta) {
          return { rangoInvalido: true };
        }
      }
      return null;
    };
  }

  /**
   * Al dar clic en “Aplicar filtros”, emitimos si el form es válido.
   */
  aplicarFiltros() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const params: HistorialParams = {
      invernaderoId:   Number(v.invernaderoId),
      zonaId:          v.zonaId != null ? Number(v.zonaId) : undefined,
      sensorId:        v.sensorId != null ? Number(v.sensorId) : undefined,
      tipoParametroId: Number(v.tipoParametroId),
      fechaDesde:      new Date(v.desde),
      fechaHasta:      new Date(v.hasta)
    };

    this.filtrosSubmit.emit(params);
  }

  /**
   * Aplica filtros automáticamente cuando se cargan las listas iniciales.
   */
  private tryAutoApply() {
    if (!this.defaultsApplied && this.invLoaded && this.paramLoaded && this.form.valid) {
      this.defaultsApplied = true;
      this.aplicarFiltros();
    }
  }

  /**
   * Formatea un objeto Date a 'YYYY-MM-DD' para el input type="date".
   */
  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  ngOnDestroy(): void {
    this.invSub?.unsubscribe();
    this.zonaSub?.unsubscribe();
  }
}
