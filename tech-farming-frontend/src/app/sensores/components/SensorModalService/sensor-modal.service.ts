import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Sensor } from '../../models/sensor.model';

export type SensorModalType = 'view' | 'edit' | 'delete' | 'create';

@Injectable({ providedIn: 'root' })
export class SensorModalService {
  modalType$ = new BehaviorSubject<SensorModalType | null>(null);
  selectedSensor$ = new BehaviorSubject<Sensor | null>(null);
  closing$ = new BehaviorSubject<boolean>(false);  // Nuevo

  openModal(type: SensorModalType, sensor: Sensor | null) {
    this.closing$.next(false);
    this.selectedSensor$.next(sensor);
    this.modalType$.next(type);
  }

  async closeWithAnimation(delayMs: number = 300) {
    this.closing$.next(true);
    await new Promise(resolve => setTimeout(resolve, delayMs));
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