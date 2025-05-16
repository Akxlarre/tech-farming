// src/app/invernaderos/components/invernadero-delete-modal.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvernaderoModalService } from '../invernadero-modal.service';
import { InvernaderoService } from '../invernaderos.service';

@Component({
  selector: 'app-invernadero-delete-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-box max-w-md">
      <h2 class="text-xl font-semibold mb-4 text-red-600">Eliminar Invernadero</h2>
      <p>¿Estás seguro que deseas eliminar este invernadero y todas sus zonas?</p>

      <div class="modal-action justify-end mt-4">
        <button type="button" class="btn btn-ghost" (click)="cancel()">Cancelar</button>
        <button type="button" class="btn btn-error text-white" (click)="confirmDelete()">Eliminar</button>
      </div>
    </div>
  `
})
export class InvernaderoDeleteModalComponent {
  constructor(
    private modal: InvernaderoModalService,
    private invSvc: InvernaderoService
  ) {}

  cancel() {
    this.modal.closeWithAnimation();
  }

  confirmDelete() {
    const inv = this.modal.selectedInv$.value;
    if (inv && inv.id) {
      this.invSvc.eliminarInvernadero(inv.id).subscribe({
        next: () => this.modal.closeWithAnimation(),
        error: err => console.error('Error eliminando invernadero', err)
      });
    } else {
      this.modal.closeWithAnimation();
    }
  }
}
