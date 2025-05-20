import {
    Component,
    OnInit,
    OnDestroy,
    HostListener,
    ElementRef,
    ViewChild
  } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { Subscription } from 'rxjs';
  import { UmbralModalService } from '../umbral-modal.service';
  
  @Component({
    selector: 'app-umbral-drawer-wrapper',
    standalone: true,
    imports: [CommonModule],
    template: `
      <!-- Overlay -->
      <div
        class="fixed inset-0 bg-black/50 z-40"
        [ngClass]="{ 'opacity-0': closing, 'opacity-100': !closing }"
        (click)="onOverlayClick($event)"
      ></div>
  
      <!-- Drawer -->
      <div
        #drawer
        class="fixed top-0 right-0 h-full bg-white shadow-xl z-50 w-full sm:w-1/2 md:w-1/3 transform transition-transform duration-300 ease-in-out overflow-auto"
        [ngClass]="{ 'translate-x-full': closing, 'translate-x-0': !closing }"
      >
        <ng-content></ng-content>
      </div>
    `,
    styles: [`
      .transition-transform { transition-property: transform; }
    `]
  })
  export class UmbralDrawerWrapperComponent implements OnInit, OnDestroy {
    closing = false;
    private sub!: Subscription;
    @ViewChild('drawer', { static: true }) drawer!: ElementRef;
  
    constructor(public modal: UmbralModalService) {}
  
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
      if (!this.drawer.nativeElement.contains(event.target)) {
        this.modal.closeWithAnimation();
      }
    }
  }
  