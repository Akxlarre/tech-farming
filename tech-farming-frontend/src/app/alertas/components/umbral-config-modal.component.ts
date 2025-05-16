// src/app/umbrales/components/umbral-config-modal.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UmbralService } from '../umbral.service';
import { UmbralModalService } from '../umbral-modal.service';
import { Umbral } from '../../models/index';

@Component({
  selector: 'app-umbral-config-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-box">
      <h2 class="text-xl font-semibold mb-4">
        {{ isEdit ? 'Editar Umbral' : 'Crear Umbral' }}
      </h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label"><span class="label-text">Ámbito</span></label>
            <select formControlName="ambito" class="select select-bordered w-full">
              <option value="global">Global</option>
              <option value="invernadero">Invernadero</option>
              <option value="sensor">Sensor</option>
            </select>
          </div>
          <div *ngIf="form.value.ambito !== 'global'">
            <label class="label"><span class="label-text">ID Invernadero</span></label>
            <input formControlName="invernadero_id" type="number" class="input input-bordered w-full" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input formControlName="tipo_parametro_id" type="number" placeholder="Tipo Parametro ID"
                 class="input input-bordered w-full" />
          <input formControlName="sensor_parametro_id" type="number" placeholder="Sensor Parametro ID"
                 class="input input-bordered w-full" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input formControlName="advertencia_min" type="number" placeholder="Advertencia Min"
                 class="input input-bordered w-full" />
          <input formControlName="advertencia_max" type="number" placeholder="Advertencia Max"
                 class="input input-bordered w-full" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input formControlName="critico_min" type="number" placeholder="Critico Min (opc.)"
                 class="input input-bordered w-full" />
          <input formControlName="critico_max" type="number" placeholder="Critico Max (opc.)"
                 class="input input-bordered w-full" />
        </div>
        <div class="modal-action justify-end">
          <button type="button" class="btn btn-ghost" (click)="cancel()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">{{ isEdit ? 'Guardar' : 'Crear' }}</button>
        </div>
      </form>
    </div>
  `
})
export class UmbralConfigModalComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  constructor(
    private fb: FormBuilder,
    private umbralService: UmbralService,
    private modal: UmbralModalService
  ) {}
  ngOnInit() {
    const sel = this.modal.selectedUmbral$.value;
    this.isEdit = !!sel?.id;
    this.form = this.fb.group({
      id: [sel?.id || null],
      ambito: [sel ? this.getAmbito(sel) : 'global', Validators.required],
      tipo_parametro_id: [sel?.tipo_parametro_id || null],
      invernadero_id: [sel?.invernadero_id || null],
      sensor_parametro_id: [sel?.sensor_parametro_id || null],
      advertencia_min: [sel?.advertencia_min || '', Validators.required],
      advertencia_max: [sel?.advertencia_max || '', Validators.required],
      critico_min: [sel?.critico_min || null],
      critico_max: [sel?.critico_max || null]
    });
    this.setFieldValidators();
  }
  private getAmbito(u: Umbral): string {
    if (u.sensor_parametro_id) return 'sensor';
    if (u.invernadero_id) return 'invernadero';
    return 'global';
  }
  private setFieldValidators() {
    this.form.get('ambito')!.valueChanges.subscribe(val => {
      ['invernadero_id', 'sensor_parametro_id'].forEach(field => {
        const ctrl = this.form.get(field)!;
        if ((val === 'invernadero' && field === 'invernadero_id') ||
            (val === 'sensor' && field === 'sensor_parametro_id')) {
          ctrl.setValidators([Validators.required]);
        } else {
          ctrl.clearValidators();
        }
        ctrl.updateValueAndValidity();
      });
    });
  }
  cancel() { this.modal.closeWithAnimation(); }
  onSubmit() {
    const payload = this.form.value;
    const obs = this.isEdit
      ? this.umbralService.actualizarUmbral(payload.id, payload)
      : this.umbralService.crearUmbral(payload);
    obs.subscribe(() => this.modal.closeWithAnimation());
  }
}
