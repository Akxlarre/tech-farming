import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SensorModalService } from '../../../SensorModalService/sensor-modal.service';

@Component({
  selector: 'app-sensor-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sensor-create-modal.component.html',
  styleUrls: ['./sensor-create-modal.component.css']
})
export class SensorCreateModalComponent implements OnInit {
  formulario!: FormGroup;
  invernaderos = ['Invernadero Norte', 'Invernadero Sur'];
  zonas = ['Zona A', 'Zona B'];
  parametros = ['Temperatura', 'Humedad', 'P', 'K', 'N'];

  // Estado del modal de token
  tokenModalOpen = false;
  tokenHidden = true;
  tokenValue = '';

  constructor(private fb: FormBuilder, public modalService: SensorModalService) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      invernadero: ['', Validators.required],
      zona: ['', Validators.required],
      fechaInstalacion: ['', Validators.required],
      posX: [0, [Validators.required, Validators.min(0)]],
      posY: [0, [Validators.required, Validators.min(0)]],
      estado: [true],
      parametros: this.fb.array([])
    });
  }

  /** Acceso al FormArray de parámetros */
  get parametrosFormArray(): FormArray {
    return this.formulario.get('parametros') as FormArray;
  }

  /** Verifica si un parámetro está seleccionado */
  isParametroChecked(param: string): boolean {
    return this.parametrosFormArray.value.includes(param);
  }

  /** Agrega o remueve parámetros del FormArray */
  toggleParametro(param: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.parametrosFormArray.push(this.fb.control(param));
    } else {
      const idx = this.parametrosFormArray.controls.findIndex(ctrl => ctrl.value === param);
      if (idx !== -1) {
        this.parametrosFormArray.removeAt(idx);
      }
    }
  }

  guardar(): void {
    if (this.formulario.valid) {
      // Aquí iría el llamado al servicio para crear el sensor y obtener el token
      // Por ahora simulamos la generación de un token aleatorio
      this.tokenValue = Math.random().toString(36).substring(2, 14);
      this.tokenModalOpen = true;
    } else {
      this.formulario.markAllAsTouched();
    }
  }
  copyToken(): void {
    navigator.clipboard.writeText(this.tokenValue)
      .then(() => {
        console.log('✅ Token copiado al portapapeles');
      })
      .catch(err => {
        console.error('❌ Error copiando el token:', err);
      });
  }
  /** Alterna visibilidad del token */
  toggleTokenVisibility(): void {
    this.tokenHidden = !this.tokenHidden;
  }

  /** Cierra el modal de token y luego el modal principal */
  closeTokenModal(): void {
    this.tokenModalOpen = false;
    this.modalService.closeModal();
  }

  cerrar(): void {
    this.modalService.closeModal();
  }
}
