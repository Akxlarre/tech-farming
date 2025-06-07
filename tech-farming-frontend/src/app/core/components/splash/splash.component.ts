import { Component } from '@angular/core';
import { AppLogoComponent } from '../app-logo.component';

@Component({
  selector: 'app-splash',
  standalone: true,
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css'],
  imports: [AppLogoComponent],
})
export class SplashComponent {}