import { Component, ViewEncapsulation } from "@angular/core";
import { Observable } from 'rxjs/Observable';

import { AuthManager } from "../../../../authManager";
import { ExcelService } from '../../../../shared/services/excel-export.service';

import 'style-loader!./customet-list.scss';
import { CustomerListService } from './customet-list.service';

@Component({
  selector: 'customers',
  templateUrl: './customet-list.html',
})
export class CustomerListComponent {

  public customers: Array<any[]> = [];
  public res_pending: boolean;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  public maxSize: number = 5;
  err_message:string;

  constructor(private _excelService: ExcelService, private _customerService: CustomerListService, public authManager: AuthManager) {

  }

  ngOnInit() {
    this.getCustomers();
  }

  getCustomers() {
    this._customerService.get(this.currentPage, this.itemsPerPage).subscribe(result => {
      this.totalItems = result.count;
      this.customers = result.data;
    })
  }

  setPage(): void {
    this.getCustomers();
  }

  downloadData() {
    this.res_pending=true;
    this._customerService.downloanData().subscribe(output => {
      this.res_pending=false;
      this._excelService.exportAsExcelFile(output, 'customer_list')
    })
  }
}
