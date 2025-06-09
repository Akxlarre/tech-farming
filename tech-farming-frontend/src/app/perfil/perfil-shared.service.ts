import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PerfilSharedService {
  avatarUrl = signal<string>('');
  nombre = signal<string>('');

  actualizarAvatar(url: string) {
    this.avatarUrl.set(url);
  }
}
