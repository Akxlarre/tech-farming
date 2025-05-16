import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { VariableCardsComponent } from '../dashboard/components/variable-card/variable-card.component'; 
import { TrendChartComponent } from './components/tendencia/trend-chart.component';
import { AlertPanelComponent } from './components/alertas-resumen/alert-panel.component';
import { SensorStatusComponent } from './components/estado-sensores/sensor-status.component';
import { SensorMapComponent } from './components/mapa-invernaderos/sensor-map.component'; 
import { NextPredictionComponent } from './components/prediccion-resumen/next-prediction.component';
@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, VariableCardsComponent, TrendChartComponent, AlertPanelComponent, SensorStatusComponent, SensorMapComponent, NextPredictionComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
}