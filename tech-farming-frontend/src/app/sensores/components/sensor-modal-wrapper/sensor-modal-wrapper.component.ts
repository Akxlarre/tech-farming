import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorModalService } from '../../components/SensorModalService/sensor-modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sensor-modal-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-modal-wrapper.component.html',
  styleUrls: ['./sensor-modal-wrapper.component.css']
})
export class SensorModalWrapperComponent implements OnInit, OnDestroy {
  closing = false;
  private sub!: Subscription;

  @ViewChild('modalContent', { static: true }) modalContent!: ElementRef;

  constructor(public modalService: SensorModalService) {}

  ngOnInit() {
    this.sub = this.modalService.closing$.subscribe(val => this.closing = val);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

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
