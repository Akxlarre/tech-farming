import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-predicciones-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-5 mx-6">
      <h1 class="text-4xl font-bold text-success tracking-tight">Predicciones</h1>
    </div>
  `
})
export class PrediccionesHeaderComponent {}
