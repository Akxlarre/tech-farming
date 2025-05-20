import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvernaderoModalService } from '../invernadero-modal.service';
import { InvernaderoService } from '../invernaderos.service';

@Component({
  selector: 'app-invernadero-delete-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-semibold text-error mb-3">Eliminar Invernadero</h2>
      <p class="text-base-content">¿Estás seguro que deseas eliminar este invernadero y todas sus zonas?</p>
      <div class="flex justify-end gap-2 mt-6">
        <button class="btn btn-outline btn-neutral" (click)="cancel()">Cancelar</button>
        <button class="btn btn-error shadow-lg hover:shadow-xl" (click)="confirmDelete()">Eliminar</button>
      </div>
    </div>
  `
})
export class InvernaderoDeleteModalComponent {
  constructor(private modal: InvernaderoModalService, private invSvc: InvernaderoService) {}
  cancel() { this.modal.closeWithAnimation(); }
  confirmDelete() {
    const inv = this.modal.selectedInv$.value;
    if (inv?.id) {
      this.invSvc.eliminarInvernadero(inv.id).subscribe({ next: () => this.modal.closeWithAnimation(), error: err => console.error(err) });
    } else this.modal.closeWithAnimation();
  }
}
