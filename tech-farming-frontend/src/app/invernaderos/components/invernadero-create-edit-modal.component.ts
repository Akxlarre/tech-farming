// src/app/invernaderos/components/invernadero-create-edit-modal.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { InvernaderoService } from '../invernaderos.service';
import { InvernaderoModalService } from '../invernadero-modal.service';
import { Invernadero, Zona } from '../models/invernadero.model';

@Component({
  selector: 'app-invernadero-create-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-3xl font-bold text-secondary mb-6">
        {{ isEdit ? 'Editar Invernadero' : 'Crear Invernadero' }}
      </h2>

      <form [formGroup]="form"
            (ngSubmit)="onSubmit()"
            class="space-y-6 text-base-content">

        <!-- Nombre + Estado -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label class="label"><span class="label-text">Nombre</span></label>
            <input formControlName="nombre"
                   placeholder="Nombre del invernadero"
                   class="input input-bordered w-full focus:border-primary focus:ring-0" />
          </div>

          <div>
            <label class="label"><span class="label-text">Estado</span></label>
            <select formControlName="estado"
                    class="select select-bordered w-full focus:border-primary focus:ring-0">
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>
        </div>

        <!-- Descripción -->
        <div>
          <label class="label"><span class="label-text">Descripción</span></label>
          <textarea formControlName="descripcion"
                    placeholder="Descripción (opcional)"
                    class="textarea textarea-bordered w-full h-24 placeholder-opacity-50 focus:border-secondary focus:ring-0">
          </textarea>
        </div>

        <!-- Zonas -->
        <div>
          <h3 class="text-xl font-semibold mb-2">Zonas</h3>

          <!-- Aquí conectamos el FormArray -->
          <div formArrayName="zonas"
               class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-auto p-4 border border-base-content/20 rounded-box">

            <div *ngFor="let zCtrl of zonas.controls; let i = index"
                 [formGroupName]="i"
                 class="p-4 bg-base-200 rounded-lg shadow hover:shadow-lg transition">

              <div class="flex justify-between items-center mb-2">
                <h4 class="font-semibold text-secondary">Zona {{ i + 1 }}</h4>
                <button type="button"
                        class="btn btn-sm btn-error"
                        (click)="removeZona(i)">🗑️</button>
              </div>

              <input formControlName="nombre"
                     placeholder="Nombre zona"
                     class="input input-bordered w-full mb-2 focus:border-primary focus:ring-0" />

              <textarea formControlName="descripcion"
                        placeholder="Descripción zona"
                        class="textarea textarea-bordered w-full h-16 focus:border-secondary focus:ring-0">
              </textarea>
            </div>
          </div>

          <button type="button"
                  class="btn btn-outline btn-primary mt-4 shadow hover:shadow-md"
                  (click)="addZona()">
            ➕ Añadir Zona
          </button>
        </div>

        <!-- Acciones -->
        <div class="flex justify-end gap-4">
          <button type="button"
                  class="btn btn-outline btn-neutral"
                  (click)="modal.closeWithAnimation()">
            Cancelar
          </button>
          <button type="submit"
                  class="btn btn-primary shadow-lg hover:shadow-xl"
                  [disabled]="form.invalid">
            {{ isEdit ? 'Guardar cambios' : 'Crear' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class InvernaderoCreateEditModalComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private invSvc: InvernaderoService,
    public  modal: InvernaderoModalService
  ) {}

  ngOnInit() {
    const sel = this.modal.selectedInv$.value;
    this.isEdit = sel !== null;

    this.form = this.fb.group({
      id:          [sel?.id  || null],
      nombre:      [sel?.nombre || '', Validators.required],
      descripcion: [sel?.descripcion || ''],
      estado:      [sel?.estado || 'Activo', Validators.required],
      zonas:       this.fb.array(
                      (sel?.zonas || []).map(z => this.createZonaGroup(z))
                    )
    });

    // ya no añadimos zona inicial automáticamente
  }

  get zonas(): FormArray {
    return this.form.get('zonas') as FormArray;
  }

  createZonaGroup(z?: Zona): FormGroup {
    return this.fb.group({
      id:          [z?.id || null],
      nombre:      [z?.nombre || '', Validators.required],
      descripcion: [z?.descripcion || ''],
      activo:      [z?.activo ?? true]
    });
  }

  addZona() {
    this.zonas.push(this.createZonaGroup());
  }

  removeZona(i: number) {
    this.zonas.removeAt(i);
  }

  onSubmit() {
    if (this.form.invalid) return;

    const inv: Invernadero = {
      ...this.form.value,
      zonas: this.form.value.zonas as Zona[]
    };

    const obs = this.isEdit
      ? this.invSvc.editarInvernadero(inv)
      : this.invSvc.crearInvernadero(inv);

    obs.subscribe({
      next: () => this.modal.closeWithAnimation(),
      error: err => console.error(err)
    });
  }
}
