import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from './models/usuario.model';

export type AdminModalType = 'create' | 'edit' | 'delete';

@Injectable({ providedIn: 'root' })
export class AdminModalService {
  modalType$ = new BehaviorSubject<AdminModalType | null>(null);
  selectedUsuario$ = new BehaviorSubject<Usuario | null>(null);
  closing$ = new BehaviorSubject<boolean>(false);

  openModal(type: AdminModalType, usuario: Usuario | null = null) {
    this.closing$.next(false);
    this.selectedUsuario$.next(usuario);
    this.modalType$.next(type);
  }

  async closeWithAnimation(delayMs = 300) {
    this.closing$.next(true);
    await new Promise(res => setTimeout(res, delayMs));
    this.modalType$.next(null);
    this.selectedUsuario$.next(null);
    this.closing$.next(false);
  }

  closeModal() {
    this.modalType$.next(null);
    this.selectedUsuario$.next(null);
    this.closing$.next(false);
  }
}
