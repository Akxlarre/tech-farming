import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SensorModalType = 'create' | 'view' | 'edit' | 'delete';

@Injectable({ providedIn: 'root' })
export class SensorModalService {
  modalType$ = new BehaviorSubject<SensorModalType|null>(null);
  closing$   = new BehaviorSubject<boolean>(false);

  openModal(type: SensorModalType) {
    this.closing$.next(false);
    this.modalType$.next(type);
  }

  async closeWithAnimation(delayMs = 300) {
    this.closing$.next(true);
    await new Promise(res => setTimeout(res, delayMs));
    this.modalType$.next(null);
    this.closing$.next(false);
  }

  closeModal() {
    this.modalType$.next(null);
    this.closing$.next(false);
  }
}
