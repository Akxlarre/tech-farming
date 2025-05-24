export interface LecturaSensor {
    time: string;            // ISO timestamp
    parametros: string[];    // p.ej. ['humedad']
    valores: number[];       // p.ej. [60.5]
  }