import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ReportService } from '../report.service';

import 'style-loader!../datepick.css';

@Component({
    selector: 'collection-report',
    templateUrl: './collection-report.html',
    styleUrls: ['../report.scss']
})

export class CollectionComponent {

    public alerts: any = [];
    public print_disabled: boolean = false;
    public res_pending: boolean;
    report_data: any = [];
    filter: any = {};
    public total: any = { balance: 0 }
    dtRange: any = [];


    constructor(private reportService: ReportService, private router: Router) { }

    ngOnInit() {

    }

    dateChanged() {
        this.filter.start_date = new Date(this.dtRange[0]);
        this.filter.end_date = new Date(this.dtRange[1]);
    }

    submitReportdata() {
        this.total.balance = 0;
        this.reportService.getCollectionInfo(this.filter).subscribe(result => {
            this.report_data = [];
            if (result.success && Array.isArray(result.data)) {
                this.filter.start_date = result.data_of.start_date;
                this.filter.end_date = result.data_of.end_date;
                if (result.data.length > 0) {
                    this.report_data = result.data;
                } else {
                    this.alerts.push({
                        type: "danger",
                        msg: "No data found",
                        timeout: 4000
                    });
                }
            } else {
                this.alerts.push({
                    type: "danger",
                    msg: "Internal server error.",
                    timeout: 4000
                });
            }
        })
    }

    rowSelected(id) {
        this.router.navigateByUrl(`/pages/inventory/report/collection-report/${id.year}-${id.month}-${id.day}`);
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