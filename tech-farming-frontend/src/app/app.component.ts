import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from "./shared/components/notification.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent],
  template: `<router-outlet></router-outlet>
  <app-notification></app-notification>`,
})
export class AppComponent {}