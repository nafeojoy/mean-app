import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { GiftService } from './gift.service';
import { GiftModelService } from './gift.model.service';

import 'style-loader!./gift.scss';

@Component({
    selector: 'gift-add',
    templateUrl: './gift.add.html',
    providers: [GiftModelService]
})
export class GiftAddComponent {
    form: FormGroup;

    constructor(private giftService: GiftService, private modelService: GiftModelService, private location: Location) {
        this.form = this.modelService.getFormModel();
    }

    addGift() {
        let gift = this.modelService.getFormValue(this.form);
        this.giftService.add(gift).subscribe(() => {
            this.location.back();
        });
    }
}