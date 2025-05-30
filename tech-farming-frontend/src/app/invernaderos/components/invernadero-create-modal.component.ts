import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-invernadero-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-8 space-y-6 bg-base-100 rounded-lg shadow-lg w-full max-w-2xl">
      <h2 class="text-[1.625rem] font-bold text-success flex items-center gap-2">
        Crear Nuevo Invernadero
      </h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Nombre -->
        <div>
          <label class="label-base-content">Nombre</label>
          <input
            formControlName="nombre"
            placeholder="Ej: Invernadero Norte"
            class="input input-bordered w-full"
          />
          <p class="text-error text-sm mt-1" *ngIf="form.get('nombre')?.touched && form.get('nombre')?.invalid">
            El nombre es obligatorio y debe tener máximo 50 caracteres.
          </p>
        </div>

        <!-- Descripción -->
        <div>
          <label class="label-base-content">Descripción (opcional)</label>
          <textarea
            formControlName="descripcion"
            rows="2"
            class="textarea textarea-bordered w-full"
          ></textarea>
        </div>

        <!-- Zonas -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold text-lg">Zonas ({{ zonas.length }}/{{ maxZonas }})</h3>
            <button
              type="button"
              class="btn btn-sm btn-outline"
              (click)="addZona()"
              [disabled]="zonas.length >= maxZonas"
            >
              + Añadir Zona
            </button>
          </div>

          <!-- Error si no hay zonas -->
          <div class="min-h-[1.25rem] mb-2">
            <p class="text-error text-sm" *ngIf="zonas.length === 0 && zonasTouched">
              Debes añadir al menos una zona.
            </p>
          </div>

          <!-- Scroll interno -->
          <div class="max-h-[300px] overflow-y-auto pr-2 space-y-4" formArrayName="zonas">
            <div
              *ngFor="let zona of zonas.controls; let i = index"
              [formGroupName]="i"
              class="bg-base-200 p-4 rounded space-y-2"
            >
              <div class="flex justify-between items-center">
                <h4 class="font-medium text-base">Zona {{ i + 1 }}</h4>
                <button
                  type="button"
                  class="btn btn-xs btn-error"
                  (click)="removeZona(i)"
                  [disabled]="zonas.length === 1"
                  title="No puedes eliminar la única zona"
                >
                  Eliminar
                </button>
              </div>

              <div>
                <label class="label-base-content">Nombre</label>
                <input
                  formControlName="nombre"
                  class="input input-bordered w-full"
                  placeholder="Ej: Zona A"
                />
                <p class="text-error text-sm mt-1" *ngIf="zona.get('nombre')?.touched && zona.get('nombre')?.invalid">
                  Obligatorio. Máx. 50 caracteres.
                </p>
              </div>

              <div>
                <label class="label-base-content">Descripción (opcional)</label>
                <textarea
                  formControlName="descripcion"
                  class="textarea textarea-bordered w-full"
                  rows="2"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" class="btn btn-ghost" (click)="close.emit()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || zonas.length === 0">
            Crear Invernadero
          </button>
        </div>
      </form>
    </div>
  `
})
export class InvernaderoCreateModalComponent implements OnInit {
  @Output() saved = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  form!: FormGroup;
  zonasTouched = false;
  maxZonas = 50;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: [''],
      zonas: this.fb.array([])
    });

    this.addZona(); // Al menos una zona por defecto
  }

  get zonas(): FormArray {
    return this.form.get('zonas') as FormArray;
  }

  addZona(): void {
    if (this.zonas.length < this.maxZonas) {
      this.zonas.push(this.fb.group({
        nombre: ['', [Validators.required, Validators.maxLength(50)]],
        descripcion: ['']
      }));
    }
  }

  removeZona(index: number): void {
    if (this.zonas.length > 1) {
      this.zonas.removeAt(index);
    }
  }

  onSubmit(): void {
    this.zonasTouched = true;

    if (this.form.invalid || this.zonas.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.saved.emit(this.form.value);
  }
}
