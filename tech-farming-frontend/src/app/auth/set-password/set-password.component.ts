import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-set-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './set-password.component.html',
})
export class SetPasswordComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  setForm = this._formBuilder.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  errorMessage = signal<string | null>(null);
  passwordsDoNotMatch = false;
  showSuccessModal = signal(false);
  sessionActiva = signal(false);

  ngOnInit() {
  if (typeof window === 'undefined') return;
  const supabase = this._authService.getClient();
  const url = new URL(window.location.href);
  const isInvitacion = url.searchParams.get('invitacion') === 'true';

  supabase.auth.getSession().then(({ data }) => {
    const user = data?.session?.user;
    const noConfirmed = user?.email_confirmed_at === null;

    if (isInvitacion && user && noConfirmed) {
      this.sessionActiva.set(true);
    } else {
      this._router.navigateByUrl('/login');
    }
  });
}

  async submit() {
    this.setForm.markAllAsTouched();

    const password = this.setForm.get('password')?.value ?? '';
    const confirmPassword = this.setForm.get('confirmPassword')?.value ?? '';

    if (password !== confirmPassword) {
      this.passwordsDoNotMatch = true;
      return;
    } else {
      this.passwordsDoNotMatch = false;
    }

    if (this.setForm.invalid) return;
    
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
