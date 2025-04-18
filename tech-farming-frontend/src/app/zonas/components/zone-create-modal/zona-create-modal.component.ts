import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ZonaModalService } from '../zonaModalService/zona-modal.service';

@Component({
  selector: 'app-zona-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './zona-create-modal.component.html',
  styleUrls: ['./zona-create-modal.component.css']
})
export class ZonaCreateModalComponent implements OnInit {
  formulario!: FormGroup;
  loading = false;

  invernaderos = ['Invernadero Norte', 'Invernadero Sur']; // Simulación, luego conectar con backend

  constructor(
    private fb: FormBuilder,
    public zonaModalService: ZonaModalService
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
        console.log('✅ Zona creada:', this.formulario.value);
        this.zonaModalService.closeModal();
        this.loading = false;
      }, 1000);
    } else {
      this.formulario.markAllAsTouched();
    }
  }

  cerrar(): void {
    this.zonaModalService.closeWithAnimation();
  }
}
