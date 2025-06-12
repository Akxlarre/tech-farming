// src/app/predicciones/components/trend-gauge.component.ts

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trend-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [attr.width]="size" [attr.height]="size/2" viewBox="0 0 100 50">
      <!-- Arco de fondo -->
      <path
        d="M10,50 A40,40 0 0,1 90,50"
        stroke="#ddd"
        stroke-width="10"
        fill="none"
      />
      <!-- Arco coloreado según pct -->
      <path
        [attr.d]="gaugeArc"
        [attr.stroke]="gaugeColor"
        stroke-width="10"
        fill="none"
      />
      <!-- Aguja -->
      <line
        x1="50" y1="50"
        [attr.x2]="needleX" [attr.y2]="needleY"
        stroke="#333"
        stroke-width="2"
      />
      <!-- Centro -->
      <circle cx="50" cy="50" r="3" fill="#333"/>
    </svg>
  `,
  styles: [`
    :host { display: block; text-align: center; }
  `]
})
export class TrendGaugeComponent implements OnChanges {
  /** porcentaje de variación (-100 a +100) */
  @Input() pct = 0;
  /** diámetro en px del SVG (ancho) */
  @Input() size = 100;

  gaugeArc = '';
  needleX = 50;
  needleY = 10; // default pointing straight up

  ngOnChanges(changes: SimpleChanges) {
    this.updateGauge();
  }

  private updateGauge() {
    const angleDeg = (this.pct / 200) * 180 - 90; // mapeo a [-90, +90]
    const a = angleDeg * Math.PI / 180;
    // computa puntos polares
    const start = this.polarToCartesian(50, 50, 40, -90);
    const end   = this.polarToCartesian(50, 50, 40, angleDeg);
    const largeArc = Math.abs(this.pct) > 100 ? 1 : 0;
    this.gaugeArc = `M${start.x},${start.y} A40,40 0 ${largeArc},1 ${end.x},${end.y}`;

    // posición de la aguja
    this.needleX = 50 + 40 * Math.cos(a);
    this.needleY = 50 + 40 * Math.sin(a);
  }

  private polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = (angleDeg) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  }

  /** Color del arco según nivel */
  get gaugeColor(): string {
    const p = Math.abs(this.pct);
    if (p >= 10) return 'var(--p-error)';
    if (p >= 5)  return 'var(--p-warning)';
    return 'var(--p-success)';
  }
}
