import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-variable-card',
    imports: [CommonModule],
    templateUrl: './variable-card.component.html',
    styleUrls: ['./variable-card.component.css']
})
export class VariableCardsComponent {
    temperatura = { nombre: 'Temperatura', valor: '22°C', icon: '🌡️' };
    humedad = { nombre: 'Humedad', valor: '45%', icon: '💧' };
  
    npk = [
      { nombre: 'Nitrógeno (N)', valor: '10%', icon: '🟢' },
      { nombre: 'Fósforo (P)', valor: '8%', icon: '🟣' },
      { nombre: 'Potasio (K)', valor: '12%', icon: '🟠' },
    ];
  }