import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';

import { FilterDataService } from '../../../shared/data-services/filter-data.service';
import { ProductService } from '../../../shared/services';

@Component({
    selector: 'similar-products',
    templateUrl: './similar-products.html'
})
export class SimilarProductsComponent {
    @Input() public relatedProduct: any;

    private _busy: any;

    @Input()
    set spinner(value) {
        this._busy = value;
    }

    get spinner() {
        return this._busy;
    }

    @Output()
    selectedProductLoader: EventEmitter<any> = new EventEmitter();

    constructor(private router: Router, private filterDataService: FilterDataService, public productService: ProductService) { }

    getSelectedProduct(product_slug) {
        this.filterDataService.removeBreadcrumbData();
        this.router.navigate(['book', product_slug]);
        this.selectedProductLoader.emit(product_slug);
    }
}