import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-export-options',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown">
      <button tabindex="0"
              class="btn bg-transparent border-success text-base-content hover:bg-success hover:text-success-content">
        <svg class="w-5 h-5 stroke-base-content hover:stroke-success-content"
             fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v12m0 0l-3-3m3 3l3-3M20 21H4a2 2 0 01-2-2V5a2 2 0 012-2h8l8 8v10a2 2 0 01-2 2z"/>
        </svg>
        <span class="text-base-content group-hover:text-success-content">Exportar</span>
      </button>
      <ul tabindex="0" class="menu dropdown-content mt-2 p-2 shadow-lg bg-base-100 rounded-box w-32">
        <li><a (click)="onSelect('pdf')">PDF</a></li>
        <li><a (click)="onSelect('excel')">Excel</a></li>
        <li><a (click)="onSelect('csv')">CSV</a></li>
      </ul>
    </div>
  `
})
export class ExportOptionsComponent {
  @Output() exportar = new EventEmitter<'pdf' | 'excel' | 'csv'>();

  onSelect(format: 'pdf' | 'excel' | 'csv') {
    this.exportar.emit(format);
  }
}
