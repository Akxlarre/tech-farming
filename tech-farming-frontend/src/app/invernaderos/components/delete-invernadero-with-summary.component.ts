import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { InvernaderoService } from '../invernaderos.service';
import { Invernadero, Zona } from '../models/invernadero.model';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'delete-invernadero-with-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-base-100 p-6 rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 class="text-2xl font-bold text-error mb-4">Eliminar Invernadero</h2>

      <!-- Si aún estamos cargando la información -->
      <div *ngIf="isLoading" class="text-center py-8">
        <svg
          class="animate-spin w-8 h-8 text-error mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
        <p class="mt-2">Cargando datos del invernadero…</p>
      </div>

      <!-- Una vez cargada la info, mostramos el resumen -->
      <div *ngIf="!isLoading">
        <p class="mb-2">
          <strong>Nombre:</strong> {{ invernadero?.nombre }}
        </p>
        <p class="mb-2">
          <strong>Descripción:</strong> {{ invernadero?.descripcion || '—' }}
        </p>

        <h3 class="text-lg font-semibold mt-4 mb-2">Zonas Asociadas</h3>
        <ul class="list-disc ml-6 mb-4">
          <li *ngFor="let z of zonas">
            {{ z.nombre }} 
            <span class="text-sm text-gray-600">
              ({{ z.activo ? 'Activa' : 'Inactiva' }}, sensores: {{ z.sensoresCount }})
            </span>
          </li>
        </ul>

        <ng-container *ngIf="!todasZonasInactivas; else eliminarForm">
          <p class="text-red-600 mt-4">
            Para eliminar este invernadero, todas sus zonas deben estar en estado <strong>Inactivo</strong>. Recuerda que al eliminar un invernadero, estarás eliminando todas sus zonas (y, por cascada, todos sus sensores y alertas asociadas).
          </p>
        </ng-container>

        <!-- Confirmación textual -->
        <ng-template #eliminarForm>
          <p class=" text-red-600">
            Al confirmar, se eliminará este invernadero y todas sus zonas (y, por cascada,
            sensores y alertas asociadas).
          </p>
          <p class="mt-4">
            Escribe <strong>Eliminar {{ invernadero?.nombre }}</strong> para confirmar:
          </p>
          <input
            type="text"
            class="input input-bordered w-full"
            [(ngModel)]="confirmText"
            placeholder="Escribe aquí para confirmar"
          />
        </ng-template>

        <div class="flex justify-end gap-3 pt-4">
          <button
            class="btn btn-ghost"
            (click)="onCancelClicked()"
          >
            Cancelar
          </button>
          <button
            *ngIf="todasZonasInactivas"
            class="btn btn-error text-white"
            [disabled]="!puedeEliminar"
            (click)="onConfirmClicked()"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `
})
export class DeleteInvernaderoWithSummaryComponent implements OnInit {
  /** ID del invernadero que queremos eliminar */
  @Input() invernaderoId!: number;

  /** Emitimos el ID cuando el usuario confirma la eliminación */
  @Output() confirmDelete = new EventEmitter<number>();

  /** Emitimos cuando el usuario cancela */
  @Output() cancel = new EventEmitter<void>();

  invernadero: Invernadero | null = null;
  zonas: Array<{ nombre: string; activo: boolean; sensoresCount: number }> = [];
  isLoading = true;
  confirmText = '';

  constructor(private svc: InvernaderoService) {}

  ngOnInit() {
    this.loadDetalle();
  }

  private loadDetalle() {
    this.isLoading = true;
    this.svc.getInvernaderoDetalle(this.invernaderoId)
      .pipe(
        catchError(() => {
          // Si falla al cargar, simplemente no mostramos nada y cerramos
          this.cancel.emit();
          return of(null);
        })
      )
      .subscribe(detalle => {
        if (!detalle) return;

        this.invernadero = {
          id: detalle.id,
          nombre: detalle.nombre,
          descripcion: detalle.descripcion,
          creado_en: detalle.creado_en
        };

        // Simplificamos las zonas para mostrar nombre, estado y cantidad de sensores
        this.zonas = detalle.zonas.map((z: Zona) => ({
          nombre: z.nombre,
          activo: z.activo,
          sensoresCount: Array.isArray((z as any).sensores) ? (z as any).sensores.length : 0
        }));

        this.isLoading = false;
      });
  }

  get todasZonasInactivas(): boolean {
    return this.zonas.every(z => !z.activo);
  }

  get puedeEliminar(): boolean {
    return (
      this.todasZonasInactivas &&
      this.confirmText.trim() === `Eliminar ${this.invernadero?.nombre}`
    );
  }

  onConfirmClicked() {
    // Emitimos el ID de invernadero para que el padre haga el DELETE
    this.confirmDelete.emit(this.invernaderoId);
  }

  onCancelClicked() {
    this.cancel.emit();
  }
}
