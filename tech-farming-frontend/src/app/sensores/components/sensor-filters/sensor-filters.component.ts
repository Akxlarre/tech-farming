// src/app/sensores/components/sensor-filters/sensor-filters.component.ts

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Invernadero } from '../../../invernaderos/models/invernadero.model';
import { TipoSensor } from '../../models/tipos_sensor.model';

export interface SensorFilter {
  invernadero: number | '';
  tipoSensor:   string;
  estado:       string;
  search:       string;
}

@Component({
  selector: 'app-sensor-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sensor-filters.component.html',
  styleUrls: ['./sensor-filters.component.css']
})
export class SensorFiltersComponent implements OnInit {
  @Input() invernaderos: Invernadero[] = [];
  @Input() tiposSensor: TipoSensor[]    = [];
  @Output() filtersChange = new EventEmitter<SensorFilter>();

  filterForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      invernadero: [''],
      tipoSensor:   [''],
      estado:       [''],
      search:       [''],
    });

    this.filterForm.valueChanges
      .subscribe((vals: SensorFilter) => this.filtersChange.emit(vals));
  }
}
