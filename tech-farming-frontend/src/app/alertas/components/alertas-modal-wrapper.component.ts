import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertasModalService } from '../alertas-modal.service';
import { AlertNotificationsComponent } from './alertas-notificaciones.component';

@Component({
  selector: 'app-alertas-modal-wrapper',
  standalone: true,
  imports: [CommonModule, AlertNotificationsComponent],
  template: `
    <dialog class="modal" open (click)="onOverlayClick($event)">
      <div
        #modalContent
        class="modal-box bg-base-100 rounded-2xl shadow-xl w-full max-w-[95vw] sm:max-w-2xl overflow-auto"
      >
        <app-alerts-notifications-modal></app-alerts-notifications-modal>
      </div>
    </dialog>
  `
})
export class AlertasModalWrapperComponent {
  @ViewChild('modalContent', { static: true }) modalContent!: ElementRef;

  constructor(public modal: AlertasModalService) {}

  @HostListener('document:keydown.escape')
  onEsc() {
    this.modal.closeModal();
  }

  onOverlayClick(event: MouseEvent) {
    if (!this.modalContent.nativeElement.contains(event.target)) {
      this.modal.closeModal();
    }
  }
}
