import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZoneCardComponent } from '../invernadero-card/invernadero-card.component';

@Component({
  selector: 'app-zone-card-list',
  standalone: true,
  imports: [CommonModule, ZoneCardComponent],
  templateUrl: './invernadero-card-list.component.html',
  styleUrls: ['./invernadero-card-list.component.css']
})
export class ZoneCardListComponent {
  @Input() zonas: any[] = [];
}