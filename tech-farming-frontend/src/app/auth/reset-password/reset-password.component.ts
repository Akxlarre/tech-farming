import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  private _route = inject(ActivatedRoute);

  resetForm = this._formBuilder.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  errorMessage = signal<string | null>(null);
  passwordsDoNotMatch = false;
  token: string | null = null;

  ngOnInit() {
    this.token = this._route.snapshot.queryParamMap.get('token');
    const type = this._route.snapshot.queryParamMap.get('type');

    if (!this.token || type !== 'recovery') {
      this.errorMessage.set('El enlace de restablecimiento es inválido o ha expirado.');
    }
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

    const email = this._route.snapshot.queryParamMap.get('email');
    if (!email) {
      this.errorMessage.set('El enlace de restablecimiento es inválido o ha expirado.');
      return;
    }

    if (!this.token) {
      this.errorMessage.set('El enlace de restablecimiento es inválido o ha expirado.');
      return;
    }

    try {
      const { error } = await this._authService.updatePassword(email, password, this.token);

      if (error) {
        this.errorMessage.set('Hubo un problema al restablecer la contraseña.');
      } else {
        alert('Contraseña restablecida correctamente.');
        this._router.navigateByUrl('/login');
      }
    } catch (error) {
      this.errorMessage.set('Hubo un problema al restablecer la contraseña.');
    }
  }
}
