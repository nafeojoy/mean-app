import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { OrderStatusService } from './order-status.service';
import { OrderStatusModelService } from './order-status.model.service';

import 'style-loader!./order-status.scss';

@Component({
    selector: 'order-status-edit',
    templateUrl: './order-status.edit.html',
    providers: [OrderStatusModelService],
})
export class OrderStatusEditComponent {
    form: FormGroup;
    private orderStatusId: string;

    order_status_name: any = {};
    order_status_description: any = {};

    constructor(fb: FormBuilder, private route: ActivatedRoute, private router: Router, private modelService: OrderStatusModelService,
        private orderStatusService: OrderStatusService, private location: Location) {
        this.form = this.modelService.getFormModel();
    }

    ngOnInit() {
        this.orderStatusId = this.route.snapshot.params['id'];
        let defaultLanguageCode = this.modelService.defaultLanguageCode

        if (this.orderStatusId) {
            let result: any = JSON.parse(window.localStorage.getItem(this.orderStatusId));
            // this.orderStatusService.get(this.orderStatusId).subscribe((result) => {
                this.form.controls['is_enabled'].setValue(result.is_enabled);
                this.form.controls['prinit_inprocess'].setValue(result.prinit_inprocess);
                this.form.controls['send_message'].setValue(result.send_message);
                this.form.controls['message_text'].setValue(result.message_text);
                this.order_status_name[defaultLanguageCode] = result.name;
                this.order_status_description[defaultLanguageCode] = result.description;

                let languages = result.lang;
                for (var i in languages) {
                    this.order_status_name[languages[i].code] = languages[i].content.name;
                    this.order_status_description[languages[i].code] = languages[i].content.description;
                }
            // });
        }
    }

    editOrderStatus() {
        let orderStatus = this.modelService.getFormValue(this.form);
        orderStatus._id = this.orderStatusId;
        this.orderStatusService.update(orderStatus).subscribe(() => {
            this.location.back();
        })
    }
}