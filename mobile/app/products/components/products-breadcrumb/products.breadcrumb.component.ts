import { Component, ViewEncapsulation, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'products-breadcrumb',
    templateUrl: './products.breadcrumb.html',
    encapsulation: ViewEncapsulation.None
})
export class ProductsBreadcrumbComponent {
    private _type = new BehaviorSubject<string>('');
    private _name: string;
    
    public listUrl: string;
    public typeLabel: string;
    private _count: any;

    @Input()
    set count(value) {
        this._count = value;
    }

    get count() {
        return this._count;
    }

    @Input()
    set type(value) {
        this._type.next(value);
    }

    get type() {
        return this._type.getValue();
    }

    @Input()
    set name(value) {
        this._name = value;
    }

    get name() {
        return this._name;
    }

    ngOnInit() {
        this._type.subscribe(typeVal => {
            if (typeVal && typeVal.trim() == 'category') {
                this.typeLabel = 'Categories';
                this.listUrl = '../../categories';
            } else if (typeVal && typeVal.trim() == 'author') {
                this.typeLabel = 'Authors';
                this.listUrl = '../../authors';
            } else if (typeVal && typeVal.trim() == 'publisher') {
                this.typeLabel = 'Publishers';
                this.listUrl = '../../publishers';
            }
        })
    }

    ngOnDestroy() { }
}