import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SensoresService } from '../../../../../services/sensores.service';
import { SensorModalService } from '../../../SensorModalService/sensor-modal.service';
import { Invernadero } from '../../../../../invernaderos/models/invernadero.model';
import { InvernaderoService } from '../../../../../invernaderos/invernaderos.service';
import { TipoSensor } from '../../../../models/tipos_sensor.model';
import { TipoSensorService } from '../../../../tipos_sensor.service';
import { TipoParametro } from '../../../../models/tipos_parametro.model';
import { TipoParametroService } from '../../../../tipos_parametro.service';

@Component({
    selector: 'app-sensor-create-modal',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './sensor-create-modal.component.html',
    styleUrls: ['./sensor-create-modal.component.css']
})
export class SensorCreateModalComponent implements OnInit {
  form!: FormGroup;
  invernaderos: Invernadero[] = [];
  tiposSensor: TipoSensor[] = [];
  tiposParametro: TipoParametro[] = [];

  // Estado del modal de token
  tokenModalOpen = false;
  tokenHidden = true;
  tokenValue = '';

  constructor(
    private fb: FormBuilder, 
    private modalService: SensorModalService,
    private sensorService: SensoresService,
    private invernaderoService: InvernaderoService,
    private tipoSensorService: TipoSensorService,
    private tipoParametroService: TipoParametroService,) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      invernadero_id: ['', Validators.required],
      fecha_instalacion: ['', Validators.required],
      pos_x: [0, [Validators.required, Validators.min(0)]],
      pos_y: [0, [Validators.required, Validators.min(0)]],
      parametros: [[]],
      estado: [''],
    });

    this.cargarInvernaderos();
    this.cargarTiposParametro();
  }

  cargarInvernaderos(): void {
    this.invernaderoService.obtenerInvernaderos().subscribe({
      next: (res) => this.invernaderos = res,
      error: (err) => console.error('Error al cargar invernaderos:', err)
    });
  }

  toggleEstado(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.form.get('estado')?.setValue(checked ? 'Activo' : 'Inactivo');
  }

  cargarTiposParametro(): void {
    this.tipoParametroService.obtenerTiposParametro().subscribe({
      next: (res) => { this.tiposParametro = res;
      console.log('Tipos de parámetro cargados:', this.tiposParametro); },
      error: (err) => console.error('Error cargando tipos de parámetro:', err)
    });
  }

  toggleParametro(nombre: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const parametros = this.form.get('parametros')?.value || [];
  
    if (checked) {
      this.form.get('parametros')?.setValue([...parametros, nombre]);
    } else {
      this.form.get('parametros')?.setValue(parametros.filter((p: string) => p !== nombre));
    }
  }
  
  isParametroSeleccionado(nombre: string): boolean {
    return this.form.get('parametros')?.value.includes(nombre);
  }

  guardar() {
    if (this.form.invalid || this.form.get('parametros')?.value.length === 0) {
      console.warn('Falta información o parámetros no seleccionados.');
      return;
    }

    const tipoSensorId = this.form.value.parametros.length > 1 ? 2 : 1;

    const sensorData = {
      ...this.form.value,
      tipo_sensor_id: tipoSensorId,
    };
    
    this.sensorService.crearSensor(sensorData).subscribe({
      next: (res) => {
        this.tokenValue = res.token;
        this.tokenModalOpen = true;

        alert('✅ Sensor creado exitosamente.');

        this.form.reset({
          pos_x: 0,
          pos_y: 0,
          parametros: [],
          estado: 'Inactivo'
        });
  
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
