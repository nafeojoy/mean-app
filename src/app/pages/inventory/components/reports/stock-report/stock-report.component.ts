import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { InventoryStore } from '../../../inventory.store';
import { ReportService } from '../report.service';
import 'style-loader!../report.scss';
import { ModalDirective } from 'ngx-bootstrap';
import { Subject } from 'rxjs';

@Component({
    selector: 'stock-report',
    templateUrl: './stock-report.html',
})

export class StockReportComponent extends InventoryStore {

    @ViewChild('commentAddModal') commentAddModal: ModalDirective;
    @ViewChild('commentViewModal') commentViewModal: ModalDirective;

    public newComment:any={};
    public comments:any=[];

    public err_message: string;
    public print_disabled: boolean = false;
    public res_pending: boolean;
    public filter: any = {};
    report_data: any = [];
    public stock_quantity: number = 0;
    public stock_price: number = 0;
    public stockDetailData: any = {};

    public isClear: boolean = false;
    dataList: Array<any> = [];
    show_image: boolean = true;
    itemSearchTerm$ = new Subject<string>();

    publisherList: Array<any> = [];
    publisherSearchTerm$ = new Subject<string>();
    
    @ViewChild('stockDetailModal') stockDetailModal: ModalDirective;

    constructor(private reportService: ReportService, private router: Router) { super() }

    ngOnInit() {
        this.reportService.getItemSearched(this.itemSearchTerm$)
        .subscribe(results => {
            this.dataList = results.product;
        });
        this.reportService.getPublisherSearched(this.publisherSearchTerm$)
        .subscribe(results => {
            this.publisherList = results.product;
        });
    }

    getSelectedItem(data) {
        this.filter.product = data._id;
    }

    getSelectedPublisher(data) {
        this.filter.publisher = data._id;
    }

    submitReportdata() {
        this.stock_price = 0;
        this.stock_quantity = 0;
        this.reportService.getStockHistory(this.filter).subscribe(result => {
            this.report_data = result.data;
            result.data.map(rslt => {
                this.stock_price += (rslt.stock_qty * rslt.purchase_rate);
                this.stock_quantity += rslt.stock_qty;
            })
        })
    }

    rowSelected(data) {     
    }

    reset() {
        this.report_data = [];
        this.print_disabled = false;
        this.isClear = true;
        setTimeout(() => {
            this.isClear = false;
        }, 500)
        this.filter = {};
    }

    openAddComment(data){
        this.newComment._id=data._id;
        this.commentAddModal.show();
    }

    addComment(){
        this.reportService.addCommentToStock(this.newComment).subscribe(result=>{
            if(result.ok){
                this.err_message='Success! Comment added.';
            }else{
                this.err_message='Failed! Internal Server Error.';
            }
            setTimeout(()=>{
                this.err_message='';
                this.commentAddModal.hide();
            },1000)
        })
    }

    viewComments(id){
        this.reportService.getStockItemComments(id).subscribe(results=>{
            if(results){
                this.comments=results;
            }
            this.commentViewModal.show();
        })
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