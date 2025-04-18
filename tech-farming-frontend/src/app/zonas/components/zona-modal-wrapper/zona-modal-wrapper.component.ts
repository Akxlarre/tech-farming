// src/app/zonas/components/zona-modal-wrapper/zona-modal-wrapper.component.ts
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonaModalService } from '../../components/zonaModalService/zona-modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-zona-modal-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zona-modal-wrapper.component.html',
  styleUrls: ['./zona-modal-wrapper.component.css']
})
export class ZonaModalWrapperComponent implements OnInit, OnDestroy {
  closing = false;
  private sub!: Subscription;

  @ViewChild('modalContent', { static: true }) modalContent!: ElementRef;

  constructor(public modalService: ZonaModalService) {}

  ngOnInit() {
    this.sub = this.modalService.closing$.subscribe(val => this.closing = val);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  // Esc y clic fuera
  @HostListener('document:keydown.escape')
  onEsc() {
    this.modalService.closeWithAnimation();
  }

  onOverlayClick(event: MouseEvent) {
    if (!this.modalContent.nativeElement.contains(event.target)) {
      this.modalService.closeWithAnimation();
    }
  }
}
