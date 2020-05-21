import { Component, ViewEncapsulation, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'product-breadcrumb',
    templateUrl: './product-breadcrumb.html',
    encapsulation: ViewEncapsulation.None
})
export class ProductBreadcrumbComponent {

    public _breadcrumbData: any = {};

    @Input()
    set breadcrumbData(value) {
        this._breadcrumbData = value;
    }

    get breadcrumbData() {
        return this._breadcrumbData;
    }

    ngOnInit() {

    }

    ngOnDestroy() { }
}