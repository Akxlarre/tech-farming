import {
  Component, OnInit, OnDestroy,
  HostListener, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AdminModalService } from '../admin-modal.service';

@Component({
  selector: 'app-admin-modal-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay oscuro -->
    <div class="fixed inset-0 bg-black/50 z-50"
         (click)="onOverlayClick($event)"
         [ngClass]="{ 'animate-overlayIn': !closing, 'animate-overlayOut': closing }"
    ></div>

    <!-- Contenedor modal -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        #modalContent
        class="bg-base-100 rounded-lg shadow-2xl overflow-hidden transition-all w-full max-w-[95vw] sm:max-w-xl"
        [ngClass]="{ 'animate-fadeInZoom': !closing, 'animate-fadeOutZoom': closing }"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    @keyframes overlayIn   { from{opacity:0} to{opacity:1} }
    @keyframes overlayOut  { from{opacity:1} to{opacity:0} }
    .animate-overlayIn  { animation: overlayIn 0.3s ease-out forwards; }
    .animate-overlayOut { animation: overlayOut 0.25s ease-in forwards; }

    @keyframes fadeInZoom  { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
    @keyframes fadeOutZoom { from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(0.95)} }
    .animate-fadeInZoom  { animation: fadeInZoom 0.3s ease-out forwards; }
    .animate-fadeOutZoom { animation: fadeOutZoom 0.25s ease-in forwards; }
  `]
})
export class AdminModalWrapperComponent implements OnInit, OnDestroy {
  closing = false;
  private sub!: Subscription;
  @ViewChild('modalContent', { static: true }) modalContent!: ElementRef;

  constructor(public modal: AdminModalService) {}

  ngOnInit() {
    this.sub = this.modal.closing$.subscribe(v => this.closing = v);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.modal.closeWithAnimation();
  }

  onOverlayClick(event: MouseEvent) {
    if (!this.modalContent.nativeElement.contains(event.target)) {
      this.modal.closeWithAnimation();
    }
  }
}
