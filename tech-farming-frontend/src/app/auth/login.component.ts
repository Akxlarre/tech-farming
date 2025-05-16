import { Component, inject, signal } from '@angular/core';
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
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);

  constructor(
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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

    const { email, password } = this.loginForm.value;
    this.cargando.set(true);

    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (response.error) {
          alert('Correo o contraseña incorrectos');
          this.cargando.set(false);
          return;
        }

        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        alert('Error al iniciar sesión. Por favor, verifica tus credenciales.');
        this.cargando.set(false);
      },
      complete: () => {
        this.cargando.set(false);
      }
    });
  }
}