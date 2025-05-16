import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvernaderoCardComponent } from '../invernadero-card/invernadero-card.component';

@Component({
    selector: 'app-invernadero-card-list',
    imports: [CommonModule, InvernaderoCardComponent],
    templateUrl: './invernadero-card-list.component.html',
    styleUrls: ['./invernadero-card-list.component.css']
})
export class InvernaderoCardListComponent {
  @Input() invernaderos: any[] = [];
}