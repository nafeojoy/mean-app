import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { DirectPayService } from './direct-pay.service';

@Component({
    selector: 'direct-pay-edit',
    templateUrl: './direct-pay.edit.html',
})
export class DirectPayEditComponent {
    form: FormGroup;
    directPayId:string;
    constructor(fb: FormBuilder, private route: ActivatedRoute, private router: Router,
        private directPayService: DirectPayService, private location: Location) {
        this.form = fb.group({
            'name': ['', Validators.compose([Validators.required])],
            'is_enabled': [true]
        });
    }

    ngOnInit() {
        this.directPayId = this.route.snapshot.params['id'];

        if (this.directPayId) {
            this.directPayService.get(this.directPayId).subscribe((res) => {
                this.form.controls['name'].setValue(res.name);
                this.form.controls['is_enabled'].setValue(res.is_enabled);
            });
        }
    }

    editDirectPay() {
        let value=this.form.value;
        value._id=this.directPayId;
        this.directPayService.update(this.form.value).subscribe(() => {
            this.location.back();
        })
    }
}