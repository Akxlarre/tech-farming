import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule], 
})
export class LoginComponent {
  loginForm: FormGroup;
  splashActivo = signal(true);
  loginVisible = signal(false);
  cargando = signal(false);

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', Validators.required],
    });

    this.iniciarAnimacionSplash();
  }

  iniciarAnimacionSplash() {
    setTimeout(() => {
      this.splashActivo.set(false);
      setTimeout(() => {
        this.loginVisible.set(true);
      }, 100);
    }, 2200);
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { correo, clave } = this.loginForm.value;
    this.cargando.set(true);

    setTimeout(() => {
      this.authService.iniciarSesion({ email: correo, password: clave }).subscribe({
        next: () => this.router.navigateByUrl('/dashboard'),
        error: (err: unknown) => {
          console.error('Error al iniciar sesión:', err);
          alert('Error al iniciar sesión. Por favor, verifica tus credenciales.');
          this.cargando.set(false);
        },
      });
    }, 1500);
  }
}