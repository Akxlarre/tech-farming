import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-sensor-setup-wizard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-base-100 rounded-lg shadow-lg max-w-xl w-full p-6 space-y-6">
      <!-- Progress bar -->
      <div class="w-full bg-base-200 h-2 rounded">
        <div class="h-full bg-primary rounded" [style.width.%]="progress"></div>
      </div>

      <div class="min-h-[14rem] space-y-4">
        <!-- Paso 1 -->
        <ng-container *ngIf="step === 1">
          <h3 class="text-lg font-semibold">Paso 1: Copia el token de tu sensor</h3>
          <div class="flex items-center gap-2">
            <input class="input input-bordered w-full" [value]="createdToken" readonly />
            <button class="btn btn-outline" (click)="copyToken()">Copiar</button>
          </div>
        </ng-container>

        <!-- Paso 2 -->
        <ng-container *ngIf="step === 2">
          <h3 class="text-lg font-semibold">Paso 2: Conecta físicamente el sensor</h3>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>Ubica los pines 5V, GND y de datos de la Raspberry Pi.</li>
            <li>Conecta tu sensor al pin GPIO4 o al esquema que tu ocupes.</li>
            <li>Verifica conexiones firmes y sin cortocircuitos.</li>
          </ul>
        </ng-container>

        <!-- Paso 3 -->
        <ng-container *ngIf="step === 3">
          <h3 class="text-lg font-semibold">Paso 3: Configura el sensor en la Raspberry Pi</h3>

          <p class="text-sm mb-2">
            Abre una terminal en tu Raspberry Pi y crea un entorno virtual para instalar las dependencias necesarias. Asegúrate de tener Python 3 y pip instalados, luego ejecuta el archivo de configuración del sensor:
          </p>

          <pre class="bg-base-200 p-3 rounded text-sm whitespace-pre-wrap mb-3"><code>python3 -m venv venv
            source venv/bin/activate
            pip install -r requirements.txt
            python3 setup.py</code></pre>

          <p class="text-sm text-base-content/70">
            El programa <code>setup.py</code> te guiará para:
          </p>

          <ul class="list-disc list-inside text-sm space-y-1 mt-2">
            <li>Elegir el tipo de sensor (DHT22 o NPK).</li>
            <li>Seleccionar el pin físico al que está conectado.</li>
            <li>Ingresar el token único generado en esta plataforma.</li>
            <li>Guardar esta configuración localmente.</li>
          </ul>

          <p class="text-sm text-base-content/70 mt-2">
            Si todo es correcto, se generará el archivo <code>config/sensors.json</code> y el sensor quedará listo para usarse.
          </p>
        </ng-container>

        <!-- Paso 4 -->
        <ng-container *ngIf="step === 4">
          <h3 class="text-lg font-semibold">Paso 4: Inicia el envío de datos</h3>
          <p class="text-sm">Con el entorno virtual activo ejecuta:</p>
          <pre class="bg-base-200 p-3 rounded text-sm whitespace-pre-wrap"><code>python3 main.py</code></pre>
        </ng-container>

        <!-- Paso 5 -->
        <ng-container *ngIf="step === 5">
          <h3 class="text-lg font-semibold">Paso 5: Verifica desde el panel web</h3>
          <p class="text-sm">Ingresa a Tech Farming y confirma que el sensor esté enviando lecturas.</p>
        </ng-container>
      </div>

      <div class="flex justify-between pt-4">
        <button class="btn btn-ghost" *ngIf="step === 1" (click)="onSkip()">Saltar guía</button>
        <div class="flex-1 text-end space-x-2">
          <button class="btn" (click)="prev()" [disabled]="step === 1">Atrás</button>
          <button class="btn btn-primary" *ngIf="step < totalSteps" (click)="next()">Siguiente</button>
          <button class="btn btn-success" *ngIf="step === totalSteps" (click)="onFinish()">Finalizar</button>
        </div>
      </div>
    </div>
  `
})
export class SensorSetupWizardComponent {
  @Input() createdToken = '';
  @Output() finalizado = new EventEmitter<void>();
  @Output() saltado = new EventEmitter<void>();

  constructor(private notify: NotificationService) {}

  step = 1;
  totalSteps = 5;

  get progress() {
    return (this.step - 1) * 100 / (this.totalSteps - 1);
  }

  copyToken() {
    navigator.clipboard.writeText(this.createdToken).then(
      () => this.notify.success('Token copiado al portapapeles.'),
      () => this.notify.error('No se pudo copiar el token.')
    );
  }

  next() {
    if (this.step < this.totalSteps) {
      this.step++;
    }
  }

  prev() {
    if (this.step > 1) {
      this.step--;
    }
  }

  onFinish() {
    this.finalizado.emit();
  }

  onSkip() {
    this.saltado.emit();
  }
}
