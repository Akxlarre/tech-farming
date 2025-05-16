// src/app/invernaderos/components/invernadero-create-edit-modal.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { InvernaderoService } from '../invernaderos.service';
import { InvernaderoModalService } from '../invernadero-modal.service';
import { Invernadero, Zona } from '../models/invernadero.model';

@Component({
  selector: 'app-invernadero-create-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-box max-w-3xl">
      <h2 class="text-xl font-semibold mb-4">
        {{ isEdit ? 'Editar Invernadero' : 'Crear Invernadero' }}
      </h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Nombre -->
        <div>
          <label class="label"><span class="label-text">Nombre</span></label>
          <input formControlName="nombre" placeholder="Nombre del invernadero"
            class="input input-bordered w-full" />
        </div>

        <!-- Descripción -->
        <div>
          <label class="label"><span class="label-text">Descripción</span></label>
          <textarea formControlName="descripcion" placeholder="Descripción (opcional)"
            class="textarea textarea-bordered w-full"></textarea>
        </div>

        <!-- Estado -->
        <div>
          <label class="label"><span class="label-text">Estado</span></label>
          <select formControlName="estado" class="select select-bordered w-full">
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <!-- Zonas FormArray -->
        <div formArrayName="zonas">
          <div *ngFor="let zCtrl of zonas.controls; let i = index" [formGroupName]="i"
               class="p-4 border rounded-lg mb-4">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-medium">Zona {{ i + 1 }}</h3>
              <button type="button" class="btn btn-sm btn-error" (click)="removeZona(i)">🗑️</button>
            </div>
            <div class="grid grid-cols-1 gap-2">
              <input formControlName="nombre" placeholder="Nombre zona"
                     class="input input-bordered w-full" />
              <textarea formControlName="descripcion" placeholder="Descripción zona"
                        class="textarea textarea-bordered w-full"></textarea>
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-sm" (click)="addZona()">
            ➕ Añadir Zona
          </button>
        </div>

        <!-- Botones -->
        <div class="modal-action justify-end">
          <button type="button" class="btn btn-ghost" (click)="cancel()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">
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
    private modal: InvernaderoModalService
  ) {}

  ngOnInit() {
    const sel = this.modal.selectedInv$.value;
    this.isEdit = !!sel && !!sel.id;

    this.form = this.fb.group({
      id: [sel?.id || null],
      nombre: [sel?.nombre || '', Validators.required],
      descripcion: [sel?.descripcion || ''],
      estado: [sel?.estado || 'Activo', Validators.required],
      zonas: this.fb.array(
        (sel?.zonas || []).map(z => this.createZonaGroup(z))
      )
    });

    if (!sel) {
      this.addZona();
    }
  }

  get zonas(): FormArray {
    return this.form.get('zonas') as FormArray;
  }

  createZonaGroup(z?: Zona) {
    return this.fb.group({
      id: [z?.id || null],
      nombre: [z?.nombre || '', Validators.required],
      descripcion: [z?.descripcion || ''],
      activo: [z?.activo ?? true]
    });
  }

  addZona() {
    this.zonas.push(this.createZonaGroup());
  }

  removeZona(i: number) {
    this.zonas.removeAt(i);
  }

  cancel() {
    this.modal.closeWithAnimation();
  }

  onSubmit() {
    const inv: Invernadero = {
      ...this.form.value,
      zonas: this.form.value.zonas as Zona[]
    };

    const obs = this.isEdit
      ? this.invSvc.editarInvernadero(inv)
      : this.invSvc.crearInvernadero(inv);

    obs.subscribe({
      next: () => {
        this.modal.closeWithAnimation();
      },
      error: err => console.error('Error guardando invernadero', err)
    });
  }
}
