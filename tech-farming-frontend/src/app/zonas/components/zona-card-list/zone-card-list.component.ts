import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZoneCardComponent } from '../zone-card/zone-card.component';

@Component({
  selector: 'app-zone-card-list',
  standalone: true,
  imports: [CommonModule, ZoneCardComponent],
  templateUrl: './zone-card-list.component.html',
  styleUrls: ['./zone-card-list.component.css']
})
export class ZoneCardListComponent {
  @Input() zonas: any[] = [];
}