import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertasModalService {
  modalVisible$ = new BehaviorSubject<boolean>(false);
  closing$ = new BehaviorSubject<boolean>(false);

  openModal() {
    this.closing$.next(false);
    this.modalVisible$.next(true);
  }

  async closeWithAnimation(delayMs = 300) {
    this.closing$.next(true);
    await new Promise(res => setTimeout(res, delayMs));
    this.modalVisible$.next(false);
    this.closing$.next(false);
  }

  closeModal() {
    this.modalVisible$.next(false);
    this.closing$.next(false);
  }
}
