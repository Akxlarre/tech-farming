// src/app/invernaderos/invernadero-modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Invernadero } from './models/invernadero.model';

export type InvernaderoModalType = 'view' | 'create' | 'edit' | 'delete';

@Injectable({ providedIn: 'root' })
export class InvernaderoModalService {
  modalType$       = new BehaviorSubject<InvernaderoModalType | null>(null);
  selectedInv$     = new BehaviorSubject<Invernadero | null>(null);
  closing$         = new BehaviorSubject<boolean>(false);

  openModal(
    type: InvernaderoModalType,
    inv: Invernadero | null = null
  ) {
    this.closing$.next(false);
    this.selectedInv$.next(inv);
    this.modalType$.next(type);
  }

  async closeWithAnimation(delayMs = 300) {
    this.closing$.next(true);
    await new Promise(res => setTimeout(res, delayMs));
    this.modalType$.next(null);
    this.selectedInv$.next(null);
    this.closing$.next(false);
  }

  closeModal() {
    this.modalType$.next(null);
    this.selectedInv$.next(null);
    this.closing$.next(false);
  }
}
