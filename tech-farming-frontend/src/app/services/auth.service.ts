import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router, private http: HttpClient) {}

  iniciarSesion(datos: { email: string; password: string }): Observable<any> {
    return this.http.post('/api/login', datos); // <-- Ahora sí funciona correctamente
  }

  cerrarSesion() {
    localStorage.clear();
    const toast = document.getElementById('toast-logout');
    if (toast) {
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 3000);
    }
    this.router.navigate(['/login']);
  }
}
