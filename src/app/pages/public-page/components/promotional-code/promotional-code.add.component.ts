import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { NgUploaderOptions } from 'ngx-uploader';
import { AppState } from '../../../../app.service';

import { PromotionalCodeService } from './promotional-code.service';

import 'style-loader!./promotional-code.scss';

@Component({
    selector: 'promotional-code-add',
    templateUrl: './promotional-code.add.html',
})

export class PromotionalCodeAddComponent {
    promo: any = {};

    constructor(private promotionalCodeService: PromotionalCodeService, private appState: AppState) {
        this.promo.is_active = true;
    }
    addPromotionalCode(data) {
        let promotionalCode = data;
        this.promotionalCodeService.add(promotionalCode).subscribe((result) => {
            if (result.success == false) {
                alert("Already Exists");
            }
            else {
                alert("Insertion is successful");
            }
        }
        )
    }
}