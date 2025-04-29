import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invernadero-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invernadero-table.component.html',
})
export class InvernaderoTableComponent {
  @Input() invernaderos: any[] = [];

  open(tipo: 'view' | 'edit' | 'delete', invernadero: any) {
    console.log(`Abrir modal: ${tipo}`, invernadero);
  }
}