import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ModalDirective } from 'ng2-bootstrap';
import { DeliveryWaitingOrderService } from './delivery-wating.order.service';

import 'style-loader!../../datepick.css';

@Component({
    selector: 'delivery-wating.order',
    templateUrl: './delivery-wating.order.html',
    styleUrls: ['./delivery-wating.order.scss']
})
export class DeliveryWaitingOrderComponent {

    @ViewChild('orderViewModal') orderViewModal: ModalDirective;
    public orders: any = [];
    public nextStatus: any = {};
    public apiBaseUrl: any;
    public resMessage: string;
    public selectedOrder: any = {};
    public res_pending: boolean;
    public delivery: any = {};
    public isSubmitted: boolean;

    public totalItems: number;
    public currentPage: number = 1;
    public maxSize: number = 5;
    
    searchObj: any = {};
    criteria: any = {}
    dtRange: any = {};
    public start_date: Date;
    public end_date: Date;
    public waiting: boolean;


    constructor(private deliveryWaitingorderService: DeliveryWaitingOrderService, private router: Router) {
        this.apiBaseUrl = this.deliveryWaitingorderService.apiBaseUrl;
    }

    ngOnInit() {
        this.delivery.time = "12:00";
        this.newOrder({ pageNo: this.currentPage });
        this.deliveryWaitingorderService.getStatus("Delivered").subscribe(status => {
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
        this.deliveryWaitingorderService.getOrder(criteria).subscribe(output => {
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

    showOrder(info, i) {
        this.selectedOrder = info;
        this.orderViewModal.show();
    }

    cancel() {
        this.orderViewModal.hide();
    }

    printEnvelop() {

    }

    save() {
        this.isSubmitted = true;
        this.res_pending = true;
        if (this.delivery.delivered_at) {
            let dt_obj = new Date(this.delivery.delivered_at);
            let times = this.delivery.time.split(':');
            dt_obj.setHours(times[0], times[1]);
            this.isSubmitted = false;
            let data = {
                order_id: this.selectedOrder._id,
                delivered_at: dt_obj,
                selectedStatus: {
                    _id: this.nextStatus._id,
                    name: this.nextStatus.name
                }
            }

            this.deliveryWaitingorderService.delivery(data).subscribe((res) => {
                this.res_pending = false;
                if (res.success) {
                    this.resMessage = "Order delivered Success!";
                    setTimeout(() => {
                        this.resMessage = "";
                        this.newOrder(this.criteria);
                        this.orderViewModal.hide();
                    }, 2000);
                }
            })
        } else {
            this.res_pending = false;
        }
    }

}