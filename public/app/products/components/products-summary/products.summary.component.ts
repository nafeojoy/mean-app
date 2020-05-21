import { Component, ViewEncapsulation, Input } from '@angular/core';


@Component({
    selector: 'products-summary',
    templateUrl: './products.summary.html',
    encapsulation: ViewEncapsulation.None
})
export class ProductsSummaryComponent {
    private _data: any;
    @Input()
    set data(value) {
        this._data = value;
    }

    get data() {
        return this._data;
    }
}