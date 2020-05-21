import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ModalDirective } from 'ng2-bootstrap';
import { ProcessBackorderService } from './backorder-process.service';

import 'style-loader!../../datepick.css';

@Component({
    selector: 'backorder-process',
    templateUrl: './backorder-process.html',
    styleUrls: ['./backorder-process.scss']
})
export class ProcessBackorderComponent {

    @ViewChild('orderViewModal') orderViewModal: ModalDirective;
    public orders: any = [];
    public nextStatus: any = {};
    public apiBaseUrl: any;
    public resMessage: string;
    public selectedOrder: any = {};
    public res_pending: boolean;
    public splitedOrder: any = {};
    public isSplited: boolean;

    public totalItems: number;
    public currentPage: number = 1;
    public maxSize: number = 5;
    searchObj: any = {};
    criteria: any = {}
    dtRange: any = {};
    public start_date: Date;
    public end_date: Date;
    public waiting: boolean;

    constructor(private backorderProcessService: ProcessBackorderService, private router: Router) {
        this.apiBaseUrl = this.backorderProcessService.apiBaseUrl;
    }

    ngOnInit() {
        this.newOrder({ pageNo: this.currentPage });
        this.backorderProcessService.getStatus("Dispatch").subscribe(status => {
            if (status._id) {
                this.nextStatus = status;
            } else {
                alert("Something went wrong!");
                this.router.navigateByUrl("/home");
            }
        })
    }

    newOrder(criteria) {
        this.waiting = true;
        this.backorderProcessService.get(criteria).subscribe(output => {
            this.waiting = false;
            if (output.success) {
                this.totalItems = output.count;
                this.orders = output.data;
            }
        })
    }

    search() {
        this.currentPage = 1;
        this.criteria = { pageNo: this.currentPage };
        if (this.searchObj.order_no) {
            this.criteria.order_no = this.searchObj.order_no;
        }
        if (this.start_date && this.end_date) {
            this.criteria.start_date = this.start_date;
            this.criteria.end_date = this.end_date;
        }
        this.newOrder(this.criteria);
    }

    reset() {
        this.searchObj = {};
        this.dtRange = {};
        this.start_date = undefined;
        this.end_date = undefined;
        this.currentPage = 1;
        this.criteria = { pageNo: this.currentPage };
        this.newOrder(this.criteria);
    }

    dateChanged() {
        this.start_date = new Date(this.dtRange[0]);
        this.end_date = new Date(this.dtRange[1]);
    }

    setPage(pageNum): void {
        this.currentPage = pageNum;
        this.criteria.pageNo = this.currentPage;
        this.newOrder(this.criteria);
    }


    splitOrder() {
        let slctOrder = Object.assign({}, this.selectedOrder);
        let availableProducts = slctOrder.products.filter(prod => {
            return prod.stock_qty > 0 && !prod.send;
        })
        let total_book = 0;
        let total_price = 0;
        let new_prods = availableProducts.map(prd => {
            let prd_obj: any = {}
            prd_obj.image = prd.image;
            prd_obj.name = prd.name;
            prd_obj.price = prd.price;

            prd_obj.quantity = prd.quantity;
            prd_obj.send = prd.send;
            prd_obj.stock_qty = prd.stock_qty;

            prd_obj.product_id = prd._id;
            prd_obj.author = prd.authors[0].name;
            prd_obj.publisher = prd.publisher.name;
            if (prd.stock_qty >= prd.quantity) {
                total_book += prd.quantity;
                total_price += (prd.price * prd.quantity);
            } else {
                prd_obj.is_prtl = true;
                prd_obj.quantity = prd.stock_qty;
                total_book += prd.stock_qty;
                total_price += (prd.price * prd.stock_qty);
            }

            return prd_obj;
        })

        let p_o_status = slctOrder.performed_order_statuses;
        this.splitedOrder = {
            is_back_order: true,
            is_paid: slctOrder.is_paid,
            paument_method: slctOrder.paument_method,
            delivery_address: slctOrder.delivery_address,
            delivery_charge: slctOrder.delivery_charge,
            discount: slctOrder.discount,
            wrapping_charge: slctOrder.wrapping_charge,
            total_book: total_book,
            total_price: total_price,
            payment_information: this.splitedOrder.payment_information,
            parent_order: slctOrder._id,
            created_by: slctOrder.created_by,
            is_sibling: true,
            performed_order_statuses: p_o_status,
            products: new_prods.map(av => { av.send = true; return av; })
        }
        this.isSplited = true;

    }

    dispatch() {
        this.res_pending = true;
        let order = { order_id: this.selectedOrder._id, selectedStatus: this.nextStatus };
        this.backorderProcessService.dispatch(order).subscribe((res) => {
            this.res_pending = false;
            if (res._id) {
                setTimeout(() => {
                    this.resMessage = "Order dispatched Successfully!";
                    this.newOrder(this.criteria);
                    this.orderViewModal.hide();
                }, 2000);
            }
        })
    }

    rowSelected(info, i) {
        this.isSplited = false;
        this.selectedOrder = info;
        this.orderViewModal.show();
    }

    cancel() {
        this.orderViewModal.hide();
    }

    saveNewOrder() {
        this.resMessage = '';
        this.res_pending = true;
        this.splitedOrder.payable_amount = this.splitedOrder.total_price + this.splitedOrder.delivery_charge + this.splitedOrder.wrapping_charge - this.splitedOrder.discount
        this.splitedOrder.current_order_status = { status_id: this.nextStatus._id, status_name: this.nextStatus.name, updated_at: new Date() }
        this.splitedOrder.performed_order_statuses.push({ status_id: this.nextStatus._id, status_name: this.nextStatus.name, updated_at: new Date() });
        if (this.selectedOrder.payment_collection && this.selectedOrder.payment_collection.total_paid > 0) {
            this.splitedOrder.payment_collection = {
                carrier_cost: 0,
                collection_info: this.selectedOrder.payment_collection.collection_info,
                is_full_collected: this.selectedOrder.payment_collection.total_paid >= this.splitedOrder.payable_amount,
                total_paid: this.selectedOrder.payment_collection.total_paid >= this.splitedOrder.payable_amount ? this.splitedOrder.payable_amount : this.selectedOrder.payment_collection.total_paid,
                transaction_cost: this.selectedOrder.payment_collection.transaction_cost
            }

            this.splitedOrder.p_payment_collection = {
                carrier_cost: 0,
                collection_info: this.selectedOrder.payment_collection.collection_info,
                is_full_collected: false,
                total_paid: this.selectedOrder.payment_collection.total_paid >= this.splitedOrder.payable_amount ? this.selectedOrder.payment_collection.total_paid - this.splitedOrder.payable_amount : 0,
                transaction_cost: this.selectedOrder.payment_collection.transaction_cost
            }
        }

        let p_order_products = this.selectedOrder.act_product.map(prd => {
            prd.product_id = prd._id;
            prd.author = prd.authors[0].name;
            prd.publisher = prd.publisher.name ? prd.publisher.name : prd.publisher;
            let get_item = this.splitedOrder.products.find(sp_prd => { return sp_prd.product_id == prd.product_id });
            if (get_item) {
                prd.send = !get_item.is_prtl;
                prd.processed = (prd.processed + get_item.quantity);
            }
            prd.quantity = prd.act_quantity;
            return prd;
        })

        this.splitedOrder.p_products = p_order_products;
        this.splitedOrder.is_partial_process_completd = this.selectedOrder.existing_status == 2;
        this.backorderProcessService.saveSplitedOrder(this.splitedOrder).subscribe(result => {
            this.res_pending = false;
            if (result.success) {
                this.newOrder(this.criteria);
                this.resMessage = "Splited order dispatched Successfully!";
                setTimeout(() => {
                    this.resMessage = "";
                    this.orderViewModal.hide();
                }, 2000);
            }
        })
    }


}