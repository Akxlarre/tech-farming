import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SensorModalService } from '../../../SensorModalService/sensor-modal.service';

@Component({
  selector: 'app-sensor-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ sensor-create-modal.component.html',
  styleUrls: ['./ sensor-create-modal.component.css']
})
export class SensorCreateModalComponent implements OnInit {
  formulario!: FormGroup;
  invernaderos = ['Invernadero Norte', 'Invernadero Sur'];
  zonas = ['Zona A', 'Zona B'];
  parametros = ['Temperatura', 'Humedad', 'PH', 'Luz'];

  constructor(private fb: FormBuilder, public modalService: SensorModalService) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      invernadero: ['', Validators.required],
      zona: ['', Validators.required],
      fechaInstalacion: ['', Validators.required],
      posX: [0, Validators.required],
      posY: [0, Validators.required],
      estado: [true],
      parametros: this.fb.array([])
    });
  }

  toggleParametro(param: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const formArray = this.formulario.get('parametros') as FormArray;

    if (checked) {
      formArray.push(this.fb.control(param));
    } else {
      const index = formArray.controls.findIndex(ctrl => ctrl.value === param);
      if (index !== -1) formArray.removeAt(index);
    }
  }

  guardar(): void {
    if (this.formulario.valid) {
      console.log('✅ Sensor creado:', this.formulario.value);
      this.modalService.closeModal();
    } else {
      this.formulario.markAllAsTouched();
    }
  }

  cerrar(): void {
    this.modalService.closeModal();
  }
}