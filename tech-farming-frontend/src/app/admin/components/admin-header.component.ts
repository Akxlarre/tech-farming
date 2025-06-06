import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-5 mx-6">
      <h1 class="text-4xl font-bold text-success tracking-tight">Gestión de Usuarios y Permisos</h1>
      <button class="btn btn-outline btn-success gap-2" (click)="create.emit()">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4v16m8-8H4" />
        </svg>
        Agregar Usuario
      </button>
    </div>
  `,
})
export class AdminHeaderComponent {
  @Output() create = new EventEmitter<void>();
}
