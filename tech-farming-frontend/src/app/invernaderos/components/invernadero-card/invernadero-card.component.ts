import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-zone-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invernadero-card.component.html',
  styleUrls: ['./invernadero-card.component.css']
})
export class ZoneCardComponent {
  @Input() zona: any;

  ver(zona: any) {
    console.log('Ver zona', zona);
    // this.zonaModalService.openModal('view', zona);
  }
  
  editar(zona: any) {
    console.log('Editar zona', zona);
    // this.zonaModalService.openModal('edit', zona);
  }
  
  eliminar(zona: any) {
    console.log('Eliminar zona', zona);
    // this.zonaModalService.openModal('delete', zona);
  }
  
}