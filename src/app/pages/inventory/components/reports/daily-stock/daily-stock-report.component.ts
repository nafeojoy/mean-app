import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { InventoryStore } from '../../../inventory.store';
import { ReportService } from '../report.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
    selector: 'daily-stock-report',
    templateUrl: './daily-stock-report.html',
    styleUrls:['../report.scss']
})

export class DailyStockReportComponent {
    public filter: any = {};
    public err_message: string;
    report_data: any = [];
    public res_pending: boolean;
    public print_disabled: boolean = false;




    constructor(private reportService: ReportService, private router: Router) {  }
    


    ngOnInit() {
       
        this.reportService.getDailyStock(this.filter).subscribe(result => {
            this.report_data = result.data;
        })

    }
    submitReportdata() {

        this.reportService.getDailyStock(this.filter).subscribe(result => {
            this.report_data = result.data;
        })
    }


    reset() {
        this.report_data = [];
        this.print_disabled = false;
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
                    table{ width:100%; font-size: small;}
                    tr{ border: 1px solid grey;}
                    .table-id{width:1%;}
                    .req-no{width:10%; text-align: right;}
                    .req-date{width:15%; text-align: right;}
                    .req-total{width:14%; text-align: right;}
                    .req-order{width:60%; text-align: center;}
                    .report_header h3{ text-align:center;}
                    .payment-head-img{ width:50%;}
                    .payment-head-content{ width:50%; text-align:right;}
                    .purched_mode_border{border:1px dotted #ccc; padding-left:10px;}
                    div.divFooter {
                        position: fixed;
                        bottom: 0;
                    }
                }
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
        );
        popupWin.document.close();
    }


}