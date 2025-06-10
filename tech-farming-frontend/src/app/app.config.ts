import { ApplicationConfig, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { OverlayModule } from '@angular/cdk/overlay';
import { authInterceptor } from './auth/auth.interceptor';
import { AuthService } from './services/auth.service';

function initAuth() {
  const auth = inject(AuthService);
  return () => auth.restoreSession();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
    withInterceptors([authInterceptor]),
    ),
    provideAnimations(),
    OverlayModule,
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      multi: true,
    },
  ],
};