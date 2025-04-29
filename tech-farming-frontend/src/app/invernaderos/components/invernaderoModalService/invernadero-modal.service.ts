import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type InvernaderoModalType = 'create' | 'view' | 'edit' | null;

@Injectable({ providedIn: 'root' })
export class InvernaderoModalService {
  modalType$ = new BehaviorSubject<InvernaderoModalType>(null);
  selectedInvernadero$ = new BehaviorSubject<any>(null); // Puedes tipar con `Invernadero` más adelante
  closing$ = new BehaviorSubject<boolean>(false);

  openModal(type: InvernaderoModalType, invernadero: any = null) {
    this.closing$.next(false);
    this.selectedInvernadero$.next(invernadero);

    this.modalType$.next(type);
  }

  async closeWithAnimation(delay = 300) {
    this.closing$.next(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    this.modalType$.next(null);
    this.selectedInvernadero$.next(null);
    this.closing$.next(false);
  }

  closeModal() {
    this.modalType$.next(null);
    this.selectedInvernadero$.next(null);
    this.closing$.next(false);
  }
}
