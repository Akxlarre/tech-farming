import { Component, Input } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  imports: [CommonModule , FormsModule],
  templateUrl: './trend-chart.component.html',
  styleUrls: ['./trend-chart.component.css']
})
export class TrendChartComponent {
  @Input() variable: string = 'Temperatura';
  @Input() sensorSeleccionado: string = 'Sensor A';

  sensores = ['Sensor A', 'Sensor B', 'Sensor C'];
}
