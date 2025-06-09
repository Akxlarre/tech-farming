import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UmbralModalService } from '../umbral-modal.service';

@Component({
  selector: 'app-umbral-modal-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <dialog class="modal" open (click)="onOverlayClick($event)">
      <div
        #modalContent
        class="modal-box bg-base-100 rounded-2xl shadow-xl w-full max-w-3xl overflow-auto"
      >
        <ng-content></ng-content>
      </div>
    </dialog>
  `,
  styles: []
})
export class UmbralModalWrapperComponent {
  @ViewChild('modalContent', { static: true }) modalContent!: ElementRef;

  constructor(public modal: UmbralModalService) {}

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
