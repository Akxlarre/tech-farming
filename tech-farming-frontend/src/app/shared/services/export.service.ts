import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    const blob = new Blob(["\uFEFF" + csvRows], { type: 'text/csv;charset=utf-8;' });
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
      autoTable(doc, { head: [headers], body: rows });
    } else {
      doc.text('No data', 10, 10);
    }
    doc.save(`${filename}.pdf`);
  }
}
