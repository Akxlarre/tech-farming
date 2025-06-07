import { Component, Input } from '@angular/core';
import { AppLogoComponent } from "../app-logo.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css'],
  imports: [CommonModule, AppLogoComponent],
})
export class SplashComponent {
  @Input() fadeOut = false;
}
