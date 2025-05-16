import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-alert-panel',
    imports: [CommonModule],
    templateUrl: './alert-panel.component.html',
    styleUrls: ['./alert-panel.component.css']
})
export class AlertPanelComponent {
  @Input() alertas = [
    { tipo: 'error', mensaje: 'Sensor S003 fuera de rango (pH bajo)' },
    { tipo: 'warning', mensaje: 'Humedad baja en Invernadero Sur' }
  ];
}