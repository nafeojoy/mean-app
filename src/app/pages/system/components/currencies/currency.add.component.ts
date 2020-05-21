import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';

import { CurrencyService } from './currency.service';

import 'style-loader!./currency.scss';

@Component({
    selector: 'currency-add',
    templateUrl: './currency.add.html'
})
export class CurrencyAddComponent {
    newCurrency: any = {};

    constructor(private currencyService: CurrencyService, private location: Location) {
        this.newCurrency.is_enabled = false;
    }

    addCurrency() {
        this.currencyService.add(this.newCurrency).subscribe(() => {
            this.location.back();
        })
    }
}