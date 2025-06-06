// src/app/dashboard/components/footer.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer
      class="
        bg-base-100 dark:bg-base-800 
        border-t border-base-200 dark:border-base-700 
        px-6 py-6 
        text-sm 
        text-base-content/60 dark:text-base-content/50 
        flex flex-col sm:flex-row justify-between items-center
      "
    >
      <!-- 1) Fecha de última actualización -->
      <div>
        Última actualización:
        <time
          [attr.datetime]="ultimaActualizacion.toISOString()"
          class="font-medium"
        >
          {{ ultimaActualizacion | date: 'dd/MM/yyyy HH:mm' }}
        </time>
      </div>

      <!-- 2) Enlaces auxiliares -->
      <div class="mt-4 sm:mt-0 flex gap-3">
        <!-- Icono de descarga + enlace “Generar reporte” -->
        <a
          href="#"
          class="
            flex items-center gap-1 
            hover:underline hover:underline-offset-2 
            transition-opacity duration-150 
            opacity-80 hover:opacity-100
          "
          aria-label="Generar reporte"
        >
          <!-- SVG de descarga:⬇ -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 text-base-content/60 dark:text-base-content/40"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M3 14a1 1 0 011-1h3v-4a1 1 0 112 
                 0v4h3a1 1 0 011 1v3a1 1 0 11-2 
                 0v-2H6v2a1 1 0 11-2 0v-3zM9 
                 3a1 1 0 012 0v6h2a1 1 0 110 
                 2H9a1 1 0 110-2h2V3z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Generar reporte</span>
        </a>

        <!-- Icono de soporte:☎ -->
        <a
          href="#"
          class="
            flex items-center gap-1 
            hover:underline hover:underline-offset-2 
            transition-opacity duration-150 
            opacity-80 hover:opacity-100
          "
          aria-label="Soporte Técnico"
        >
          <!-- SVG de teléfono/soporte -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 text-base-content/60 dark:text-base-content/40"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M2.003 5.884l2-3A1 1 0 015 
                 2h3a1 1 0 011 1v4a1 1 0 01-1 
                 1H6.414l-.707.707a12.027 12.027 
                 0 006.879 6.879l.707-.707V13a1 1 
                 0 011-1h4a1 1 0 011 1v3a1 1 0 
                 01-1 1h-3a1 1 0 01-1-1v-1.007A14.97 
                 14.97 0 012.003 5.884z"
            />
          </svg>
          <span>Soporte</span>
        </a>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  @Input() ultimaActualizacion!: Date;
}
