import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SensorService } from '../../../../sensores.service';
import { SensorModalService } from '../../../SensorModalService/sensor-modal.service';
import { Zona } from '../../../../../zonas/models/zona.model';
import { ZonaService } from '../../../../../zonas/zonas.service';
import { Invernadero } from '../../../../models/invernadero.model';
import { InvernaderoService } from '../../../../invernaderos.service';
import { TipoSensor } from '../../../../models/tipo_sensor.model';
import { TipoSensorService } from '../../../../tipo_sensor.service';

@Component({
  selector: 'app-sensor-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sensor-create-modal.component.html',
  styleUrls: ['./sensor-create-modal.component.css']
})
export class SensorCreateModalComponent implements OnInit {
  form!: FormGroup;
  zonas: Zona[] = [];
  invernaderos: Invernadero[] = [];
  tiposSensor: TipoSensor[] = [];

  // Estado del modal de token
  tokenModalOpen = false;
  tokenHidden = true;
  tokenValue = '';

  constructor(
    private fb: FormBuilder, 
    private modalService: SensorModalService,
    private sensorService: SensorService,
    private invernaderoService: InvernaderoService,
    private zonaService: ZonaService,
    private tipoSensorService: TipoSensorService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      invernadero_id: ['', Validators.required],
      zona: ['', Validators.required],
      fecha_instalacion: ['', Validators.required],
      pos_x: [0, [Validators.required, Validators.min(0)]],
      pos_y: [0, [Validators.required, Validators.min(0)]],
      tipo_sensor_id: [null, Validators.required],
      estado: [true],
    });

    this.cargarInvernaderos();
    this.cargarTiposSensor();
  }

  cargarInvernaderos(): void {
    this.invernaderoService.obtenerInvernaderos().subscribe({
      next: (res) => this.invernaderos = res,
      error: (err) => console.error('Error al cargar invernaderos:', err)
    });
  }

  cargarZonas(invernaderoId: number): void {
    this.zonaService.obtenerZonasPorInvernadero(invernaderoId).subscribe({
      next: (res) => this.zonas = res,
      error: (err) => console.error('Error al cargar zonas:', err)
    });
  }

  cargarTiposSensor(): void {
    this.tipoSensorService.obtenerTiposSensor().subscribe({
      next: (res) => this.tiposSensor = res,
      error: (err) => console.error('Error al cargar tipos de sensor:', err)
    });
  }

  onInvernaderoChange(): void {
    const id = this.form.get('invernadero_id')?.value;
    if (id) {
      this.cargarZonas(id);
    } else {
      this.zonas = [];
    }
  }

  guardar() {
    if (this.form.invalid) return;
    
    this.sensorService.crearSensor(this.form.value).subscribe({
      next: (res) => {
        this.tokenValue = res.token;
        this.tokenModalOpen = true;
      },
      error: (err) => {
        console.error('Error al crear sensor:', err);
      }
    });
  }

  copyToken(): void {
    navigator.clipboard.writeText(this.tokenValue)
      .then(() => {
        console.log('✅ Token copiado al portapapeles');
      })
      .catch(err => {
        console.error('❌ Error copiando el token:', err);
      });
  }
  /** Alterna visibilidad del token */
  toggleTokenVisibility(): void {
    this.tokenHidden = !this.tokenHidden;
  }

  /** Cierra el modal de token y luego el modal principal */
  closeTokenModal(): void {
    this.tokenModalOpen = false;
    this.modalService.closeModal();
  }

  cerrar(): void {
    this.modalService.closeModal();
  }
}
