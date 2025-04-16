import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-next-prediction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './next-prediction.component.html',
  styleUrls: ['./next-prediction.component.css']
})
export class NextPredictionComponent {
  mensaje = 'Se espera una disminución de humedad del 10% en las próximas 6 horas.';
}
