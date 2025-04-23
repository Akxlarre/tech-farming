import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SensorModalService } from '../SensorModalService/sensor-modal.service';
import { Sensor } from '../../models/sensor.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sensor-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sensor-edit-modal.component.html',
  styleUrls: ['./sensor-edit-modal.component.css']
})
export class SensorEditModalComponent implements OnInit {
  editForm!: FormGroup;
  loading = false;
  sensor: Sensor | null = null;

  constructor(
    private fb: FormBuilder,
    public modalService: SensorModalService
  ) {}

  ngOnInit(): void {
    this.sensor = this.modalService.selectedSensor$.getValue() ?? null;

    this.editForm = this.fb.group({
      nombre: [this.sensor?.nombre || '', Validators.required],
      tipo: [this.sensor?.tipo_sensor_id || '', Validators.required],
      estado: [this.sensor?.estado || '', Validators.required],
      zona: [this.sensor?.zona || '', Validators.required],
    });
  }

  guardarCambios(): void {
    if (this.editForm.valid) {
      this.loading = true;

      setTimeout(() => {
        console.log('✅ Sensor actualizado:', this.editForm.value);
        this.loading = false;
        this.modalService.closeModal();
      }, 1000);
    } else {
      this.editForm.markAllAsTouched();
    }
  }

  cancelar(): void {
    this.modalService.closeModal();
  }
}
