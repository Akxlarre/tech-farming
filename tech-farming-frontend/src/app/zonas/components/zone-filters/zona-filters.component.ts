import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
    selector: 'app-zona-filters',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './zona-filters.component.html'
  })
  export class ZonaFiltersComponent {
    selectedEstado: string = '';
    search: string = '';
  }