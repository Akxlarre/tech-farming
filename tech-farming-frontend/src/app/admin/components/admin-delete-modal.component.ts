import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-delete-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-base-100 rounded-lg shadow-lg max-w-md w-full space-y-4">
      <h2 class="text-xl font-bold text-error">⚠️ Eliminar usuario</h2>
      <p>¿Estás seguro de que quieres eliminar a <strong>{{ nombre }}</strong>?</p>
      <p>Escribe <strong>Eliminar {{ nombre }}</strong> para confirmar:</p>
      <input
        type="text"
        class="input input-bordered w-full"
        [(ngModel)]="confirmText"
        placeholder="Escribe aquí para confirmar"
      />
      <div class="flex justify-end space-x-2 pt-2">
        <button class="btn btn-ghost" (click)="cancel.emit()" [disabled]="loading">Cancelar</button>
        <button class="btn btn-error" [disabled]="!canDelete || loading" (click)="onDelete()">Eliminar</button>
      </div>
    </div>
  `
})
export class AdminDeleteModalComponent {
  @Input() usuarioId!: number;
  @Input() nombre = '';
  @Output() deleted = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();

  confirmText = '';
  loading = false;

  constructor(private svc: AdminService) {}

  get canDelete(): boolean {
    return this.confirmText.trim() === `Eliminar ${this.nombre}`;
  }

  onDelete() {
    if (this.loading) return;
    this.loading = true;
    this.svc.eliminarTrabajador(this.usuarioId).subscribe({
      next: () => this.deleted.emit(this.usuarioId),
      error: () => {
        this.loading = false;
        alert('No se pudo eliminar el usuario.');
      }
    });
  }
}
