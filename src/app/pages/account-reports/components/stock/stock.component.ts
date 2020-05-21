import { Component } from "@angular/core";
import 'style-loader!../../datepick.css';

@Component({
  selector: 'account-stock',
  templateUrl: './stock.html',
  styleUrls:['./stock.scss']
})

export class StockComponent {

 
  dtRange: any = {};
  public start_date: Date;
  public end_date: Date;
  public report_data: any = [];
  public print_disabled: boolean;
  public res_pending: boolean;
  constructor() {

  }

  ngOnInit() {
  }

  dateChanged() {
    this.start_date = new Date(this.dtRange[0]);
    this.end_date = new Date(this.dtRange[1]);
  }

  submitReportdata() {

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
                table{ width:100%; font-size: 8px;}
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
                .purched_mode_border{border:1px dotted #ccc; padding-left:10px;}
                div.divFooter {
                    position: fixed;
                    bottom: 0;
                }
            }

          table{ width:100%; font-size: 8px;}
          .table-hover{}
          .table-hover tr th{text-align:left;border-bottom:0.5px dotted #ccc;}
          .table-border tr td{border-bottom:0.5px dotted #ccc;}
          .table-border td{vertical-align: top;}
          .payment-head-img{ width:50%;}
          .payment-head-content{ width:50%; text-align:right;}
          .table thead tr th { text-align: center; font-size: 8px; }
          .table tbody tr td { text-align: center; font-size: 8px; }
      </style>
    </head>
<body onload="window.print();window.close()">${printContents}</body>
  </html>`
    );
    popupWin.document.close();
  }


}