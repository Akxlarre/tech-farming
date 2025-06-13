<<<<<<< codex/introduce-exportservice-y-refactorizar-exportaciones
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class ExportService {
  toCsv(data: any[], filename: string) {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers
        .map(key => {
          const cell = row[key] ?? '';
          return `"${String(cell).replace(/"/g, '""')}"`;
        })
        .join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }

  toExcel(data: any[], filename: string) {
    if (!data || data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] } as XLSX.WorkBook;
    const excelBuffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    saveAs(blob, `${filename}.xlsx`);
  }

  toPdf(data: any[], filename: string) {
    const doc = new jsPDF();
    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(h => row[h]));
      (doc as any).autoTable({ head: [headers], body: rows });
    } else {
      doc.text('No data', 10, 10);
    }
    doc.save(`${filename}.pdf`);
  }
}
=======
// src/app/shared/services/export.service.ts
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class ExportService {
  /**
   * Exporta datos a un archivo CSV.
   * @param filename Nombre del archivo, por ejemplo 'datos.csv'
   * @param headers  Encabezados de la tabla
   * @param rows     Filas de datos como arreglos de valores
   */
  exportAsCSV(filename: string, headers: string[], rows: any[][]): void {
    const csvContent = [headers, ...rows]
      .map(r => r.map(v => `${v}`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Exporta datos a un archivo Excel utilizando xlsx.
   */
  exportAsExcel(filename: string, headers: string[], rows: any[][]): void {
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Exporta datos a un PDF simple utilizando jsPDF.
   */
  exportAsPDF(filename: string, headers: string[], rows: any[][]): void {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(12);
    // Encabezados
    headers.forEach((h, i) => {
      doc.text(h, 10 + i * 40, y);
    });
    y += 10;
    // Filas
    rows.forEach(row => {
      row.forEach((cell, i) => {
        doc.text(String(cell), 10 + i * 40, y);
      });
      y += 10;
    });
    doc.save(filename);
  }
}

>>>>>>> tabs
