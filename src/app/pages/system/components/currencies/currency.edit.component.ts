import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { CurrencyService } from './currency.service';

import 'style-loader!./currency.scss';

@Component({
    selector: 'currency-edit',
    template: './currency.edit.html',
})
export class CurrencyEditComponent {
    currentCurrency: any = {};

    constructor(private route: ActivatedRoute, private router: Router,
        private currencyService: CurrencyService, private location: Location) { }

    ngOnInit() {
        let currencyId = this.route.snapshot.params['id'];

        if (currencyId) {
            this.currencyService.get(currencyId).subscribe((res) => {
                this.currentCurrency = res
            });
        }
    }

    editCurrency() {
        this.currencyService.update(this.currentCurrency).subscribe(() => {
            this.location.back();
        })
    }
}