import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  resetForm = this._formBuilder.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  errorMessage = signal<string | null>(null);
  passwordsDoNotMatch = false;
  showSuccessModal = signal(false);
  sessionActiva = signal(false);

  ngOnInit() {
    // Verificar si hay una sesión válida, ya sea normal o de recuperación
    this._authService.session().then(({ data }) => {
      if (data.session) {
        this.sessionActiva.set(true);
      } else {
        this._router.navigateByUrl('/login');
      }
    });

    // También se puede escuchar cambios en la sesión por si viene desde el email
    const supabase = this._authService.getClient();
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        this.sessionActiva.set(true);
      }
    });
  }

  async submit() {
    if (this.resetForm.invalid) return;

    const password = this.resetForm.get('password')?.value ?? '';
    const confirmPassword = this.resetForm.get('confirmPassword')?.value ?? '';

    if (password !== confirmPassword) {
      this.passwordsDoNotMatch = true;
      return;
    } else {
      this.passwordsDoNotMatch = false;
    }

    try {
      const { error } = await this._authService.updatePassword(password);

      if (error) {
        this.errorMessage.set('Hubo un problema al restablecer la contraseña.');
      } else {
        this.showSuccessModal.set(true);
      }
    } catch (err) {
      this.errorMessage.set('Hubo un problema inesperado al restablecer la contraseña.');
      console.error(err);
    }
  }

  async cerrarModalYRedirigir() {
    this.showSuccessModal.set(false);
    await this._authService.logout();
    this._router.navigateByUrl('/login');
  }
}
