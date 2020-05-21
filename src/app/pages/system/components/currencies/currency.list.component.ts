import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { CurrencyService } from './currency.service';

import 'style-loader!./currency.scss';

@Component({
    selector: 'currency-list',
    templateUrl: './currency.list.html',
})
export class CurrencyListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    currencies: any;
    selectedCurrency: any;

    constructor(private currencyService: CurrencyService) { }

    ngOnInit() {
        this.currencies = this.currencyService.getAll();
    }

    showDeleteModal(currency) {
        this.selectedCurrency = currency;
        this.deleteModal.show();
    }

    deleteCurrency() {
        this.currencyService.delete(this.selectedCurrency._id).subscribe(() => {
            this.deleteModal.hide();
        });
    }

    showViewModal(currency) { }
}