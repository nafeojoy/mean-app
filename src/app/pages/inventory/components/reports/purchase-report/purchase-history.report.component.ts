import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { InventoryStore } from '../../../inventory.store';
import { ReportService } from '../report.service';
import 'style-loader!../report.scss';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
    selector: 'purchase-history',
    templateUrl: './purchase-history.report.html',
    styleUrls: ['../report.scss']
})

export class PurchaseHistoryComponent extends InventoryStore {
    alerts: any = []
    public err_message: string;
    public print_disabled: boolean = false;
    public res_pending: boolean;
    public filter: any = { mode: 'All' };
    report_data: any = [];
    public total_obj: any = {};
    public purchaseDetailData: any = {};
    public other_report_data: any = {};
    // @ViewChild('purchaseDetailModal') purchaseDetailModal: ModalDirective;



    constructor(private reportService: ReportService, private router: Router) { super() }

    ngOnInit() {

    }

    submitReportdata() {
        this.total_obj = { summary: 0, book_value: 0, book_qty: 0, convenience: 0, courier: 0 };
        this.res_pending = true;
        this.reportService.getPurchaseHistory(this.filter).subscribe(result => {
            this.res_pending = false;
            if (result.success) {
                if (result.data && result.data.length > 0) {
                    this.other_report_data.date_range = result.date_range;
                    this.other_report_data.print_job_number = result.print_job_number;
                    this.other_report_data.user = JSON.parse(window.localStorage.getItem('user')).name;
                    this.other_report_data.print_date = new Date();

                    this.report_data = result.data.map(rslt => {
                        this.total_obj.summary += rslt.purchase_cost;
                        this.total_obj.book_value += rslt.net_amount;
                        this.total_obj.book_qty += rslt.total_book;
                        this.total_obj.convenience += rslt.convenience;
                        this.total_obj.courier += rslt.courier_charge;
                        return rslt;
                    })
                } else {
                    this.alerts.push({
                        type: 'danger',
                        msg: "No Data found!",
                        timeout: 4000
                    });
                }
            } else {
                this.alerts.push({
                    type: 'danger',
                    msg: "Internal Server Proplem!",
                    timeout: 4000
                });
            }
        })
    }

    // rowSelected(data) {
    //     if (data.general_purchase) {
    //         this.purchaseDetailData = {
    //             general_purchase: data.general_purchase,
    //             remark: data.remark
    //         }
    //         this.purchaseDetailModal.show();
    //     } else {
    //         this.reportService.getPurchaseOrderData(data.purchase_order).subscribe(output => {
    //             this.purchaseDetailData = {
    //                 general_purchase: data.general_purchase,
    //                 remark: data.remark
    //             }
    //             let orders = output.customer_orders;
    //             this.purchaseDetailData.items= orders.map(ordr => {
    //                 console.log(ordr.products, data.books)
    //                 return {
    //                     order_no: ordr.order_no,
    //                     books: ordr.products.map(prod => {
    //                         return {
    //                             name: prod.name,
    //                             publisher: prod.publisher,
    //                             sales_price: prod.price,
    //                             purchase_price: data.books.find(dt => { return prod.product_id == dt.product_id }).price
    //                         }
    //                     }),
    //                 }
    //             })
    //         })
    //         this.purchaseDetailModal.show();
    //     }
    // }


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