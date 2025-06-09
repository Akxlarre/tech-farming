// src/app/shared/components/notification.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationPayload } from '../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="message"
      class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300"
      [ngClass]="{
        'bg-success text-success-content': type === 'success',
        'bg-error text-error-content':   type === 'error',
        'bg-info text-info-content':    type === 'info',
        'bg-warning text-warning-content': type === 'warning'
      }"
      [style.opacity]="visible ? '1' : '0'"
    >
      {{ message }}
    </div>
  `,
  styles: [`
    /* Para suavizar aparición / desaparición */
    .transition-opacity { transition: opacity 0.3s ease; }
  `]
})
export class NotificationComponent implements OnInit {
  message: string | null = null;
  type: 'success' | 'error' | 'info' | 'warning' = 'info';
  visible = false;

  private sub!: Subscription;

  constructor(private notif: NotificationService) {}

  ngOnInit() {
    this.sub = this.notif.notification$.subscribe((n: NotificationPayload | null) => {
      if (n == null) {
        // Ocultar el toast
        this.visible = false;
        // Limpiamos después de darle tiempo a la transición
        setTimeout(() => {
          this.message = null;
        }, 300);
        return;
      }

      // Mostrar nuevo toast
      this.message = n.message;
      this.type = n.type;
      this.visible = true;

      // Auto‐ocultar tras “duration” ms
      setTimeout(() => {
        this.notif.clear();
      }, n.duration ?? 3000);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
