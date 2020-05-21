import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { OrderStatusService } from './order-status.service';
import { OrderStatusModelService } from './order-status.model.service';

import 'style-loader!./order-status.scss';

@Component({
    selector: 'order-status-add',
    templateUrl: './order-status.add.html',
    providers: [OrderStatusModelService]
})
export class OrderStatusAddComponent {
    form: FormGroup;

    constructor(private orderStatusService: OrderStatusService, private modelService: OrderStatusModelService, private location: Location) {
        this.form = this.modelService.getFormModel();
    }

    addOrderStatus() {
        let orderStatus = this.modelService.getFormValue(this.form);
        this.orderStatusService.add(orderStatus).subscribe(() => {
            this.location.back();
        });
    }
}