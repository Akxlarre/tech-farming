// src/app/umbrales/umbral-modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Umbral } from '../models';

export type UmbralModalType = 'view' | 'create' | 'edit' | 'delete';

@Injectable({ providedIn: 'root' })
export class UmbralModalService {
  modalType$   = new BehaviorSubject<UmbralModalType | null>(null);
  selectedUmbral$ = new BehaviorSubject<Umbral | null>(null);
  closing$     = new BehaviorSubject<boolean>(false);

  openModal(type: UmbralModalType, umbral: Umbral | null = null) {
    this.closing$.next(false);
    this.selectedUmbral$.next(umbral);
    this.modalType$.next(type);
  }

  async closeWithAnimation(delayMs = 300) {
    this.closing$.next(true);
    await new Promise(res => setTimeout(res, delayMs));
    this.modalType$.next(null);
    this.selectedUmbral$.next(null);
    this.closing$.next(false);
  }

  closeModal() {
    this.modalType$.next(null);
    this.selectedUmbral$.next(null);
    this.closing$.next(false);
  }
}