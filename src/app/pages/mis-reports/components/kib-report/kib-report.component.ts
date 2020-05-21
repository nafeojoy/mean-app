import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { KIBService } from './kib-report.service';
import { DatePipe } from "@angular/common";
import { ModalDirective } from 'ng2-bootstrap';

import 'style-loader!./kib-report.scss';

@Component({
    selector: 'kib-report',
    templateUrl: './kib-report.html',
})

export class KIBReportComponent {


    public query_date: Date;
    public report_data: any = [];
    public res_pending: boolean;
    err_message: string;
    selected: any = {};
    @ViewChild('updatesModal') updatesModal: ModalDirective;


    constructor(private _kIBService: KIBService) { }

    ngOnInit() {

    }

    submitReportdata() {
        this.err_message = '';
        if (this.query_date) {
            this.res_pending = true;
            this._kIBService.get(this.query_date).subscribe(result => {
                this.res_pending = false;
                if (result.success) {
                    this.report_data = result.data;
                } else {
                    this.err_message = result.message;
                }
            })
        } else {
            this.err_message = 'Select date first!'
        }
    }

    showDetail(item) {
        this.selected = item;
        this.updatesModal.show();
    }

    closeDetail() {
        this.updatesModal.hide();
    }


    reset() {
        this.report_data = [];
        this.query_date = null;
    }


    print(): void {
        let printContents, popupWin;
        printContents = document.getElementById('print-section').innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
      <html>
        <head>
          <style>
              @media print
                {     
                    table{ width:100%;}
                    .table-id{width:3%;}
                    .report-code{width:11%;}
                    .report-name{width:12%;}
                    .report-rat{width:12%;}
                    .report-quenty{width:25%;}
                    .report-price{width:10%;}
                    .report-total_amount{width:25%;}
                    .report_header h3{ text-align:center;}
                    .payment-head-img{ width:50%;}
                    .payment-head-content{ width:50%; text-align:right;}
                    .purched_mode_border{border:1px solid #ccc; padding-left:10px;}
                }

              table{ width:100%;}
              .table-hover{}
              .table-hover tr th{text-align:left;border-bottom:1px solid #ccc; border-top:1px solid #ccc; padding-top:8px; padding-bottom:8px;}
              .table-hover tr td{border-bottom:1px solid #ccc; padding-top:8px; padding-bottom:8px;}
              .payment-head-img{ width:50%;}
              .payment-head-content{ width:50%; text-align:right;}
              .table thead tr th { text-align: center; }
              .table tbody tr td { text-align: center; }
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
        );
        popupWin.document.close();
    }

}