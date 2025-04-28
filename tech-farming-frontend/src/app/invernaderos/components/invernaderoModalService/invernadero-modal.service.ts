// src/app/zonas/services/zona-modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ZonaModalType = 'create' | 'view' | 'edit' | null;

@Injectable({ providedIn: 'root' })
export class ZonaModalService {
  modalType$ = new BehaviorSubject<ZonaModalType>(null);
  selectedZona$ = new BehaviorSubject<any>(null); // Puedes tipar con `Zona` más adelante
  closing$ = new BehaviorSubject<boolean>(false);

  openModal(type: ZonaModalType, zona: any = null) {
    this.closing$.next(false);
    this.selectedZona$.next(zona);

    this.modalType$.next(type);
  }

  async closeWithAnimation(delay = 300) {
    this.closing$.next(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    this.modalType$.next(null);
    this.selectedZona$.next(null);
    this.closing$.next(false);
  }

  closeModal() {
    this.modalType$.next(null);
    this.selectedZona$.next(null);
    this.closing$.next(false);
  }
}
