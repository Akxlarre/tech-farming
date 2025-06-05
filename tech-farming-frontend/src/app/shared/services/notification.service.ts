// src/app/shared/services/notification.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationPayload {
  message: string;
  type: NotificationType;
  duration?: number; // milisegundos, por defecto 3000
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new Subject<NotificationPayload | null>();
  /** Emite un objeto { message, type, duration? } o null para limpiar */
  public notification$: Observable<NotificationPayload | null> = this.notificationSubject.asObservable();

  constructor() {}

  /** Limpia (oculta) el toast */
  clear() {
    this.notificationSubject.next(null);
  }

  /** Muestra un toast de tipo “success” */
  success(message: string, duration = 3000) {
    this.notificationSubject.next({ message, type: 'success', duration });
  }

  /** Muestra un toast de tipo “error” */
  error(message: string, duration = 3000) {
    this.notificationSubject.next({ message, type: 'error', duration });
  }

  /** Muestra un toast de tipo “info” */
  info(message: string, duration = 3000) {
    this.notificationSubject.next({ message, type: 'info', duration });
  }

  /** Muestra un toast de tipo “warning” */
  warning(message: string, duration = 3000) {
    this.notificationSubject.next({ message, type: 'warning', duration });
  }

  /**
   * Pide confirmación al usuario y devuelve una Promise<boolean>.
   * Por simplicidad utilizamos window.confirm, pero podrías reemplazarlo por un modal
   * más personalizado en tu HTML si quisieras. Ej:
   *
   *   this.notify.confirm('¿Borrar zona?') .then(confirmed => { … });
   */
  confirm(message: string): Promise<boolean> {
    return new Promise(resolve => {
      const ok = window.confirm(message);
      resolve(ok);
    });
  }
}
