import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgUploaderOptions } from 'ngx-uploader';
import { Location } from '@angular/common';


import { PromotionalCodeService } from './promotional-code.service';

@Component({
    selector: 'promotional-code-edit',
    templateUrl: './promotional-code.edit.html',
})
export class PromotionalCodeEditComponent {

    public promo: any = {};
    public _id: string;

    constructor(private route: ActivatedRoute, private promotionalCodeService: PromotionalCodeService) { }

    ngOnInit() {
        this._id = this.route.snapshot.params['id'];
        this.promotionalCodeService.getById(this._id).subscribe((result) => {
            this.promo = result;
        })
    }

    updatePromoCode(data) {
        let promo = data;

        this.promotionalCodeService.update(promo).subscribe(response => {
            if (response.success == true) {
                alert("Promotional Code Updated");
            } else {
                alert("Update Failed");
            }
        })
    }
}