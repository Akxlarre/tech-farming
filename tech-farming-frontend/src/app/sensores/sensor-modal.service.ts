import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Sensor } from './models/sensor.model';

export type SensorModalType = 'create' | 'edit' | 'view' | 'delete';

@Injectable({ providedIn: 'root' })
export class SensorModalService {
  modalType$       = new BehaviorSubject<SensorModalType|null>(null);
  selectedSensor$  = new BehaviorSubject<Sensor|null>(null);
  closing$         = new BehaviorSubject<boolean>(false);

  openModal(type: SensorModalType, sensor: Sensor|null = null) {
    this.closing$.next(false);
    this.selectedSensor$.next(sensor);
    this.modalType$.next(type);
  }

  async closeWithAnimation(delayMs = 300) {
    this.closing$.next(true);
    await new Promise(res => setTimeout(res, delayMs));
    this.modalType$.next(null);
    this.selectedSensor$.next(null);
    this.closing$.next(false);
  }

  closeModal() {
    this.modalType$.next(null);
    this.selectedSensor$.next(null);
    this.closing$.next(false);
  }
}