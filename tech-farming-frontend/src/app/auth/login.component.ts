import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

interface LoginForm {
  email: FormControl<null | string>;
  password: FormControl<null | string>;
}

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
})

export class LoginComponent {
  private _formBuilder = inject(FormBuilder);

  private _authService = inject(AuthService);

  private _router = inject(Router);

  cargando = signal(false);
  loginErrorMessage = signal<string | null>(null);
  resetErrorMessage = signal<string | null>(null);
  showResetPasswordModal = signal(false);
  resetEmail = '';

  form = this._formBuilder.group<LoginForm>({
    email: this._formBuilder.control(null, [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control(null, [Validators.required]),
  });

  resetForm = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async submit() {
    if (this.form.invalid) return;

    this.cargando.set(true);
    this.loginErrorMessage.set(null);

    try {
      const inicioExitoso = await this._authService.login({
        email: this.form.value.email ?? '',
        password: this.form.value.password ?? '',
      });

      if (inicioExitoso.error) {
        this.loginErrorMessage.set('Correo o contraseña incorrectos.');
      } else {
        this._router.navigateByUrl('/dashboard');
      }
    } catch (error) {
      this.loginErrorMessage.set('Hubo un problema al iniciar sesión. Intenta de nuevo.');
      console.error('Error en el inicio de sesión:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  openResetPasswordModal(event: Event) {
    event.preventDefault();
    this.showResetPasswordModal.set(true);
  }

  closeResetPasswordModal() {
    this.showResetPasswordModal.set(false);
    this.resetForm.reset();
  }

  async sendResetPasswordEmail() {
    this.resetErrorMessage.set(null);

    if (this.resetForm.invalid) {
      this.resetErrorMessage.set('Ingresa un correo válido.');
      return;
    }

    const email = this.resetForm.get('email')?.value ?? '';

    try {
      const { error } = await this._authService.resetPassword(email);

      if (error) {
        console.error("Error en Supabase:", error);
        this.resetErrorMessage.set('Hubo un problema al enviar el correo. Verifica tu correo e inténtalo de nuevo.');
        return;
      }

      alert('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
      this.closeResetPasswordModal();
    } catch (error) {
      this.resetErrorMessage.set('Error al enviar el correo de recuperación.');
      console.error(error);
    }
  }
}