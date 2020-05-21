import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { OrderCarrierService } from "./order-carrier.service";
import 'style-loader!./order-carrier.scss';

@Component({
    selector: 'order-carrier-edit',
    templateUrl: './order-carrier.edit.html',
    styleUrls: ['./order-carrier.scss'],
})
export class OrderCarrierEditComponent {

    public orderCarrier: any = {};
    public cat_id: string;
    public alerts: any = [];
    public isDisabled: boolean;
    public isSubmited: boolean;

    constructor(private orderCarrierService: OrderCarrierService, private route: ActivatedRoute, private location: Location) { }

    ngOnInit() {
        this.cat_id = this.route.snapshot.params['id'];
        this.orderCarrierService.get(this.cat_id).subscribe(result => {
            console.log('result--------------agdhasgd')
            console.log(result)
            if (result._id) {
                this.orderCarrier = result;
            }
        })
    }

    updateOrderCarrier() {
        this.isSubmited = true;
        this.isDisabled = true;
        if (this.orderCarrier.name && this.orderCarrier.name != '' && this.orderCarrier.phone && this.orderCarrier.phone != '' && this.orderCarrier.address && this.orderCarrier.address != '') {
            this.orderCarrierService.update(this.orderCarrier).subscribe(result => {
                if (result.success) {
                    setTimeout((router: Router) => {
                        this.location.back();
                        this.isDisabled = false;
                    }, 2000);
                    this.alerts.push({
                        type: 'info',
                        msg: 'OrderCarrier update successfully ',
                        timeout: 4000
                    });

                } else {
                    this.isDisabled = false;
                    this.alerts.push({
                        type: 'danger',
                        msg: 'Something went wrong. Try Again',
                        timeout: 4000
                    });
                }
            })
        } else {
            this.isDisabled = false;
            this.isSubmited = true;
        }
    }

    back() {
        this.location.back();
    }

}