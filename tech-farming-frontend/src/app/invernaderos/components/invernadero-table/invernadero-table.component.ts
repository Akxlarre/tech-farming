import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-zone-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invernadero-table.component.html',
})
export class ZoneTableComponent {
  @Input() zonas: any[] = [];

  open(tipo: 'view' | 'edit' | 'delete', zona: any) {
    console.log(`Abrir modal: ${tipo}`, zona);
  }
}