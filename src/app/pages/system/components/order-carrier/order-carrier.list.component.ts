import { Component, ViewEncapsulation } from "@angular/core";

import { OrderCarrierService } from "./order-carrier.service";
import 'style-loader!./order-carrier.scss';

@Component({
    selector: 'order-carrier-list',
    templateUrl: './order-carrier.list.html'
})

export class OrderCarrierListComponent {

    public totalItems: number;
    public currentPage: number = 1;
    public maxSize: number = 5;
    public orderCarriers: any = [];
    constructor(private orderCarrierService: OrderCarrierService) {

    }

    ngOnInit() {
        this.getData(this.currentPage);
    }

    getData(pageNo) {
        this.orderCarrierService.getAll(pageNo).subscribe(result => {
            this.orderCarriers = result.data;
            this.totalItems = result.count;
        })
    }

    setPage(pageNum): void {
        this.currentPage = pageNum;
        this.getData(this.currentPage);
    }

}
