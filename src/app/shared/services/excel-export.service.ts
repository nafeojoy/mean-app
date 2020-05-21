import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {

  constructor() { }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  public importExcel(event) {
    return new Promise((resolve, reject) => {

      var input = event.target;
      var reader = new FileReader();

      reader.onload = function () {
        var fileData = reader.result;
        var wb = XLSX.read(fileData, { type: 'binary' });
        // wb.SheetNames.forEach(function (sheetName) {
        var rowObj = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        resolve(rowObj);
        // })
      };
      reader.readAsBinaryString(input.files[0]);
    });
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }



}