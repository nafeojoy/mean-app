import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';

import { GiftService } from './gift.service';
import { GiftModelService } from './gift.model.service';

import 'style-loader!./gift.scss';

@Component({
    selector: 'gift-edit',
    templateUrl: './gift.edit.html',
    providers: [GiftModelService],
})
export class GiftEditComponent {
    form: FormGroup;
    private giftId: string;

    constructor( private route: ActivatedRoute, private modelService: GiftModelService,
        private giftService: GiftService, private location: Location) {
        this.form = this.modelService.getFormModel();
    }

    ngOnInit() {
        this.giftId = this.route.snapshot.params['id'];
        if (this.giftId) {
            this.giftService.get(this.giftId).subscribe((result) => {
                this.form.controls['name'].setValue(result.name);
                this.form.controls['description'].setValue(result.description);
                this.form.controls['is_enabled'].setValue(result.is_enabled);
                this.form.controls['gift_cost'].setValue(result.gift_cost);
                this.form.controls['estimated_qty'].setValue(result.estimated_qty);
                this.form.controls['allocated_qty'].setValue(result.allocated_qty);
            });
        }
    }

    editGift() {
        let gift = this.modelService.getFormValue(this.form);
        gift._id = this.giftId;
        this.giftService.update(gift).subscribe(() => {
            this.location.back();
        })
    }
}