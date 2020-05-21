import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Location } from "@angular/common";
import { ModalDirective } from 'ng2-bootstrap';
import { PurchaseOrderService } from "../putchase-order.service";
import { Subject } from 'rxjs';

@Component({
    selector: 'purchase-order-list',
    templateUrl: './purchase-order-list.html',
    styleUrls: ['./purchase-order-list.scss']
})
export class PurchaseOrderListComponent {
    public totalItems: number;
    public currentPage: number = 1;
    public maxSize: number = 5;
    public orders: any = [];
    public order: any = {};
    public total_qty: number = 0;
    public total_price: number = 0;
    required_items: any = [];
    public dataList: any = [];
    searchProduct$ = new Subject<string>();
    filter: any = {}

    @ViewChild('receiptModal') receiptModal: ModalDirective;

    constructor(private location: Location, private _purchaseOrderService: PurchaseOrderService) { }

    ngOnInit() {
        this.getData(this.currentPage);
        this._purchaseOrderService.getProductSearched(this.searchProduct$)
            .subscribe(result => {
                this.dataList = result.product
              
            });
    }

    getSelected(selected) {
        this._purchaseOrderService.getSelectedBookOrders(selected._id)
            .subscribe(result => {
                this.orders = result;
                this.totalItems = result.length;
            })
    }

    getData(pageNo) {
        this._purchaseOrderService.getAll({ status: this.filter.status, pageNo: pageNo }).subscribe(result => {
            this.orders = result.data;
            this.totalItems = result.count;
        })
    }

    getOrderWithStatus() {
        this.currentPage = 1;
        this.getData(this.currentPage)
    }

    resetSearchFilter() {
        this.filter = {};
        this.currentPage = 1;
        this.getData(this.currentPage);
    }

    setPage(pageNum): void {
        this.currentPage = pageNum;
        this.getData(this.currentPage);
    }

    showOrder(data) {

        this.order = data;
        this.total_price = 0;
        this.total_qty = 0;
        let required_prod = this.order.orderd_products.map(prd => {
            this.total_price += (prd.purchase_price * prd.quantity);
            this.total_qty += prd.quantity;
            prd.publisher_name = prd.publisher_id.lang ? prd.publisher_id.lang[0].content.name : prd.publisher_id.name;
            if (prd.supplier) {
                prd.supplier_name = prd.supplier.name;
                prd.area = prd.supplier.area ? prd.supplier.area.name : 'Not Specified';
            } else {
                prd.supplier_name = 'Not Specified';
                prd.area = 'Not Specified';
            }
            return prd;
        })

        required_prod.sort((a, b) => (a.publisher_id._id > b.publisher_id._id) ? 1 : ((b.publisher_id._id > a.publisher_id._id) ? -1 : 0));
        //required_prod.sort((a, b) => (a.area > b.area) ? 1 : ((b.area > a.area) ? -1 : 0));
        this.required_items = required_prod;
        this.receiptModal.show();
    }

    cancel() {
        this.receiptModal.hide();
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
            img{width:50%;}
             table{ width:100%; font-size:8px;}
             h5{font-size:12px;}
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