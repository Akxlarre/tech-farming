import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-invernadero-create-modal',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './invernadero-create-modal.component.html', // <- corregido aquí
    styleUrls: ['./invernadero-create-modal.component.css']
})
export class InvernaderoCreateModalComponent {
  formulario: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  cerrar() {
    // cerrar modal
  }

  guardar() {
    if (this.formulario.valid) {
      console.log('Invernadero creado', this.formulario.value);
      // lógica para enviar datos al backend
    }
  }
}
