import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { PurchaseAcceptService } from "./purchase-accept.service";
import { ModalDirective } from 'ng2-bootstrap';
import { AuthManager } from "../../../../authManager";

import 'style-loader!./purchase-accept.scss';


@Component({
    selector: 'purchase-accept-list',
    templateUrl: './purchase-accept.list.html'
})

export class PurchaseAcceptListComponent {

    public purchaseList: any = [];
    public totalItems: number = 0;
    public maxSize: number = 5;
    public itemsPerPage: number = 10;
    public currentPage: number = 1;
    public purchase: any = {};

    public searchCriterion: any = {};
    public res_pending: boolean;

    @ViewChild('receiptModal') receiptModal: ModalDirective;


    constructor(private acceptService: PurchaseAcceptService, public authManager: AuthManager) {

    }

    ngOnInit() {
        this.getItem();
    }

    getItem() {
        this.acceptService.getAll(this.currentPage).subscribe(result => {
            if (result && result.data && Array.isArray(result.data)) {
                this.totalItems = result.count;
                this.purchaseList = result.data;
            }
        })
    }

    pageChanged(pageNum: any) {
        this.currentPage = pageNum.page;
        if (Object.keys(this.searchCriterion).length > 0)
            this.getsearch();
        else
            this.getItem();
    }

    set(data) {
        window.localStorage.setItem(data._id, JSON.stringify(data));
    }

    showPurchase(purchase) {
        this.purchase = purchase;
        this.receiptModal.show();
    }

    cancel() {
        this.receiptModal.hide();
    }

    searchPurchase() {
        this.currentPage = 1;
        this.getsearch();
    }

    getsearch() {
        this.res_pending = true;
        this.searchCriterion.pageNum = this.currentPage;
        this.acceptService.searchPurchase(this.searchCriterion).subscribe(result => {
            this.res_pending = false;
            if (result.success) {
                this.totalItems = result.count;
                this.purchaseList = result.data;
            }
        })
    }

    reset() {
        this.currentPage = 1;
        this.getItem();
    }

    print(): void {
        let printContents, popupWin;
        printContents = document.getElementById('print-section').innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          <style>
             @media print
                {
                     table{ width:100%;}
                    .table-print{width:100%;}
                }
            table{ width:100%;}
            .tbl-data td{border-bottom:0.5px dotted #ccc;}
            .table-headr td{font-size:8px;}   
          </style>
        </head>
        <body onload="window.print();window.close()">${printContents}</body>
      </html>`
        );
        popupWin.document.close();
        this.receiptModal.hide();
    }

}
