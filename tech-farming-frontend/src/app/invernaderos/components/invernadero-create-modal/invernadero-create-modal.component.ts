import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-zona-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './zona-create-modal.component.html'
})
export class ZonaCreateModalComponent {
  formulario: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  cerrar() {
    // cerrar modal usando tu ZonaModalService
  }

  guardar() {
    if (this.formulario.valid) {
      console.log('Zona creada', this.formulario.value);
      // aquí va la lógica real para enviar la zona al backend
    }
  }
