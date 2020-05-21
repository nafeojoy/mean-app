import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { DirectPayService } from './direct-pay.service';

@Component({
    selector: 'direct-pay-add',
    templateUrl: './direct-pay.add.html',
})
export class DirectPayAddComponent {
    form: FormGroup;

    constructor(fb: FormBuilder, private directPayService: DirectPayService, private location: Location) {
        this.form = fb.group({
            'name': ['', Validators.compose([Validators.required])],
            'is_enabled': [true]
        });
    }

    addDirectPay() {
        this.directPayService.add(this.form.value).subscribe(() => {
            this.location.back();
        })
    }
}