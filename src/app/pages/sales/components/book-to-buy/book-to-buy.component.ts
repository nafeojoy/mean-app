import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { BookToBuyService } from './book-to-buy.service';
import { ModalDirective } from 'ng2-bootstrap';
import { Subject } from 'rxjs/Subject';


@Component({
    selector: 'book-to-buy',
    templateUrl: './book-to-buy.html',
    styleUrls: ['./book-to-buy.scss']
})

export class BookToBuyComponent {
    public totalItems: number;
    public currentPage: number = 1;
    public maxSize: number = 5;
    public err_message: string;
    public res_pending: boolean;
    public status: any = {};
    orders: any = [];
    searctText: string;
    searchOrderNo$ = new Subject<string>();
    total_order_value: number;
    total_available: number;
    need_purchase: number;
    wait: boolean;

    @ViewChild('actionModal') actionModal: ModalDirective;
    filter: any = { mode: 'all' };
    constructor(
        private _bookToBuyService: BookToBuyService,
        private router: Router
    ) { }

    ngOnInit() {
        this.getOrderInfo(this.currentPage);
        this._bookToBuyService.getItemSearched(this.currentPage, this.searchOrderNo$)
            .subscribe(results => {
                this.orders = results.data;
            });
    }

    setPage(pageNum): void {
        this.currentPage = pageNum;
        this.getOrderInfo(this.currentPage);
    }

    getOrderInfo(pageNo) {
        this.total_available = 0;
        this.total_order_value = 0;
        this.need_purchase = 0;
        this.wait = true;
        this._bookToBuyService.getAll(pageNo, 0).subscribe(result => {
            this.wait = false;
            if (result.success) {
                this.orders = result.data;
                this.orders.map(order => {
                    let total = this.getTotal(order.products);
                    this.total_order_value += total.total_order_value;
                    this.total_available += total.total_available;
                    this.need_purchase += total.need_purchase;
                })
            }
        })
    }

    getTotal(products) {
        let total_order_value = 0;
        let total_available = 0;
        let need_purchase = 0;
        products.map(product => {
            total_order_value += ((product.sales_price * 35) / 100);
            if (product.stock_qty >= product.required_qty) {
                total_available += (product.required_qty * ((product.sales_price * 35) / 100));
            } else {
                need_purchase += (product.required_qty * ((product.sales_price * 35) / 100));
            }
        })
        return { total_order_value: total_order_value, total_available: total_available, need_purchase: need_purchase }
    }

    onActionClick(order, product) {
        this.status = Object.assign({}, product);
        this.status.order_no = order;
        this.actionModal.show();
    }

    submit() {
        if (this.status && this.status.comment && this.status.comment != '') {
            this.res_pending = true;
            this._bookToBuyService.updateStatus(this.status).subscribe(result => {
                this.res_pending = false;
                if (result.ok) {
                    this.getOrderInfo(this.currentPage);
                    this.actionModal.hide();
                }
            })
        }
    }

}