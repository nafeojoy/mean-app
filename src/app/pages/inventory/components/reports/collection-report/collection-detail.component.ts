import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ReportService } from '../report.service';
import 'style-loader!../report.scss';

@Component({
    selector: 'collection-detail',
    templateUrl: './collection-detail.html',
})

export class CollectionDetailComponent {

    public err_message: string;
    public print_disabled: boolean = false;
    public res_pending: boolean;
    report_data: any = [];
    filter:any={};
    public sales_summary: number = 0;


    constructor(private reportService: ReportService, private router: Router, public route: ActivatedRoute) { }

    ngOnInit() {
        let date=this.route.snapshot.params['detail'];
        this.submitReportdata(date);
    }


    submitReportdata(date) {
        this.sales_summary=0;
        this.reportService.getSaleDetails(date).subscribe(result => {
            this.report_data = result;
            // result.map(rslt=>{
            //     this.sales_summary+=(rslt.payable_amount-rslt.carrier_cost-rslt.transaction_cost);
            // })
        })
    }

    reset() {
        this.report_data = [];
        this.print_disabled = false;
    }

    print(): void {
    //     let printContents, popupWin;
    //     printContents = document.getElementById('print-section').innerHTML;
    //     popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    //     popupWin.document.open();
    //     popupWin.document.write(`
    //   <html>
    //     <head>
    //       <style>
    //           @media print
    //             {     
    //                 table{ width:100%;}
    //                 .table-id{width:3%;}
    //                 .report-code{width:11%;}
    //                 .report-name{width:12%;}
    //                 .report-rat{width:12%;}
    //                 .report-quenty{width:25%;}
    //                 .report-price{width:10%;}
    //                 .report-total_amount{width:25%;}
    //                 .report_header h3{ text-align:center;}
    //                 .payment-head-img{ width:50%;}
    //                 .payment-head-content{ width:50%; text-align:right;}
    //                 .purched_mode_border{border:1px solid #ccc; padding-left:10px;}
    //             }

    //           table{ width:100%;}
    //           .table-hover{}
    //           .table-hover tr th{text-align:left;border-bottom:1px solid #ccc; border-top:1px solid #ccc; padding-top:8px; padding-bottom:8px;}
    //           .table-hover tr td{border-bottom:1px solid #ccc; padding-top:8px; padding-bottom:8px;}
    //           .payment-head-img{ width:50%;}
    //           .payment-head-content{ width:50%; text-align:right;}
    //           .table thead tr th { text-align: center; }
    //           .table tbody tr td { text-align: center; }
    //       </style>
    //     </head>
    // <body onload="window.print();window.close()">${printContents}</body>
    //   </html>`
    //     );
    //     popupWin.document.close();
    }

}