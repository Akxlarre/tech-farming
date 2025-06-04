import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-5 mx-6">
      <h1 class="text-4xl font-bold text-success tracking-tight">Gestión de Usuarios</h1>
      <button class="btn btn-outline btn-success" (click)="create.emit()">Agregar Usuario</button>
    </div>
  `,
})
export class AdminHeaderComponent {
  @Output() create = new EventEmitter<void>();
}
