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
    </footer>
  `,
})
export class FooterComponent {
  @Input() ultimaActualizacion!: Date;
}
