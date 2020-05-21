import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { InventoryStore } from '../../../inventory.store';
import { ReportService } from '../report.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
    selector: 'purchase-requisition-report',
    templateUrl: './purchase-requisition-report.html',
    styleUrls:['../report.scss']
})

export class PurchaseRequisitionReportComponent extends InventoryStore {
    public err_message: string;
    public print_disabled: boolean = false;
    public res_pending: boolean;
    public filter: any = {};
    report_data: any = [];
    public total_obj: any = {};
    public purchaseDetailData: any = {};
    public other_report_data:any={};
    @ViewChild('purchaseDetailModal') purchaseDetailModal: ModalDirective;



    constructor(private reportService: ReportService, private router: Router) { super() }

    ngOnInit() {

    }

    submitReportdata() {
        this.total_obj = {summary: 0};
        this.reportService.getPurchaseRequisitions(this.filter).subscribe(result => {
            this.report_data=result.data;
            this.other_report_data.date_range=result.date_range;
            this.other_report_data.print_job_number=result.print_job_number;
            this.other_report_data.user=JSON.parse(window.localStorage.getItem('user')).name;
            this.other_report_data.print_date=new Date();
            this.report_data.map(rslt => {
                this.total_obj.summary += rslt.total_sell_price;
            })
        })
    }

    rowSelected(data) {
        if (data.general_purchase) {
            this.purchaseDetailData = {
                general_purchase: data.general_purchase,
                remark: data.remark
            }
            this.purchaseDetailModal.show();
        } else {
            this.reportService.getPurchaseOrderData(data.purchase_order).subscribe(output => {
                this.purchaseDetailData = {
                    general_purchase: data.general_purchase,
                    remark: data.remark
                }
                let orders = output.customer_orders;
                let items = [];
                orders.map(ordr => {
                    let itm = {
                        order_no: ordr.order_no,
                        books: ordr.products.map(prod => {
                            return {
                                name: prod.name,
                                publisher: prod.publisher,
                                sales_price: prod.price,
                                purchase_price: data.books.find(dt => { return prod.product_id == dt.product_id }).price
                            }
                        }),
                    }
                    items.push(itm);
                })
                this.purchaseDetailData.items = items;
            })
            this.purchaseDetailModal.show();
        }
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