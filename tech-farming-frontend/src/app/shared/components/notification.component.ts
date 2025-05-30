import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="message"
      class="fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-white transition-opacity"
      [ngClass]="{
        'bg-green-600': type === 'success',
        'bg-red-600': type === 'error',
        'bg-blue-600': type === 'info'
      }"
    >
      {{ message }}
    </div>
  `
})
export class NotificationComponent implements OnInit {
  message: string | null = null;
  type: 'success' | 'error' | 'info' = 'info';

  constructor(private notif: NotificationService) {}

  ngOnInit() {
    this.notif.notification$.subscribe(n => {
      if (!n) {
        this.message = null;
        return;
      }

      this.message = n.message;
      this.type = n.type;

      setTimeout(() => {
        this.notif.clear();
      }, n.duration ?? 3000);
    });
  }
}
