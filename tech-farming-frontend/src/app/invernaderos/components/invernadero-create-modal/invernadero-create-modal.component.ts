import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvernaderoModalService } from '../invernaderoModalService/invernadero-modal.service';

@Component({
  selector: 'app-invernadero-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invernadero-create-modal.component.html',
  styleUrls: ['./invernadero-create-modal.component.css']
})
export class InvernaderoCreateModalComponent implements OnInit {
  formulario!: FormGroup;
  loading = false;

  invernaderos = ['Invernadero Norte', 'Invernadero Sur']; // Simulación, luego conectar con backend

  constructor(
    private fb: FormBuilder,
    public invernaderoModalService: InvernaderoModalService
  ) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      invernadero: ['', Validators.required]
    });
  }

  guardar(): void {
    if (this.formulario.valid) {
      this.loading = true;
      setTimeout(() => {
        console.log('✅ Invernadero creado:', this.formulario.value);
        this.invernaderoModalService.closeModal();
        this.loading = false;
      }, 1000);
    } else {
      this.formulario.markAllAsTouched();
    }
  }

  cerrar(): void {
    this.invernaderoModalService.closeWithAnimation();
  }
}
