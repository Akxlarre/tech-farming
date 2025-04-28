import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
    selector: 'app-zona-filters',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './invernadero-filters.component.html',
    styleUrls: ['./invernadero-filters.component.css']
  })
  export class ZonaFiltersComponent {
    selectedEstado: string = '';
    search: string = '';
  }