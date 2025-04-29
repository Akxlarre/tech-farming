import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invernadero-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invernadero-card.component.html',
  styleUrls: ['./invernadero-card.component.css']
})
export class InvernaderoCardComponent {
  @Input() invernadero: any;

  ver(invernadero: any) {
    console.log('Ver invernadero', invernadero);
    // this.invernaderoModalService.openModal('view', invernadero);
  }
  
  editar(invernadero: any) {
    console.log('Editar invernadero', invernadero);
    // this.invernaderoModalService.openModal('edit', invernadero);
  }
  
  eliminar(invernadero: any) {
    console.log('Eliminar invernadero', invernadero);
    // this.invernaderoModalService.openModal('delete', invernadero);
  }
  
}