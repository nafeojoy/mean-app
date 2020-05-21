import { trigger, state, style, transition, animate } from '@angular/animations';

import { Component, ViewEncapsulation, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router, NavigationEnd } from "@angular/router";


import { PubSubService } from '../../../shared/services/pub-sub-service';
import { FilterDataService } from '../../../shared/data-services/filter-data.service';
import { fail } from 'assert';
import 'style-loader!./products.filter.scss';

@Component({
    selector: 'products-filter',
    templateUrl: './products.filter.html',
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({ transform: 'translateX(100%)', opacity: 0 }),
                    animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'translateX(0)', opacity: 1 }),
                    animate('500ms', style({ transform: 'translateX(100%)', opacity: 0 }))
                ])
            ]
        ),
        trigger(
            'expandDown', [
                transition(':enter', [
                    style({ transform: 'translateY(100%)', opacity: 0 }),
                    animate('500ms', style({ transform: 'translateY(0)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'translateY(0)', opacity: 1 }),
                    animate('500ms', style({ transform: 'translateY(100%)', opacity: 0 }))
                ])
            ]
        )
    ],
})

export class ProductsFilterComponent {

    public _checkBoxData: any = {};
    private _attributes = new BehaviorSubject<any[]>([]);
    private _categories = new BehaviorSubject<any[]>([]);
    private _authors = new BehaviorSubject<any[]>([]);
    private _publishers = new BehaviorSubject<any[]>([]);
    checkExpand: boolean = false;
    priceSwitch: boolean = false;
    categorySwitch: boolean = false;
    authorSwitch: boolean = false;
    publisherSwitch: boolean = false;
    expanded: boolean = false;
    show: boolean;

    myFilterRoute: string;
    state: string;
    showCross: boolean = false;

    @Input()
    set checkBoxData(value) {
        this._checkBoxData = value;
    }

    get checkBoxData() {
        return this._checkBoxData;
    }

    @Input()
    set attributes(value) {
        this._attributes.next(value);
    }

    get attributes() {
        return this._attributes.getValue();
    }

    @Input()
    set categories(value) {
        this._categories.next(value);
    }

    get categories() {
        return this._categories.getValue();
    }

    @Input()
    set authors(value) {
        this._authors.next(value);
    }

    get authors() {
        return this._authors.getValue();
    }

    @Input()
    set publishers(value) {
        this._publishers.next(value);
    }

    get publishers() {
        return this._publishers.getValue();
    }

    searchCriteria: any = {};

    constructor(private pubSubService: PubSubService, private filterDataService: FilterDataService, private router: Router) {
        router.events
            .filter((event) => event instanceof NavigationEnd)
            .map(() => this.router.routerState)
            .subscribe((event) => {
                this.myFilterRoute = event.snapshot.url;
                // console.log(this.myFilterRoute);
                if (this.myFilterRoute.includes("/category-books/")) {
                    this.state = 'category';
                } else if (this.myFilterRoute.includes("/author-books/")) {
                    this.state = 'author';
                } else if (this.myFilterRoute.includes("/publisher-books/")) {
                    this.state = 'publisher';
                }
            })
    }

    search(type, data, event) {
        // ref type
        // this.searchCriteria = this.filterDataService.searchData;

        if (!this.searchCriteria[type]) {
            this.searchCriteria[type] = [];
            if (this.state == 'category') {
                this.searchPage('categories', this.categories[0]);
            }
            else if (this.state == 'author') {
                this.searchPage('authors', this.authors[0]);
            }
            else if (this.state == 'publisher') {
                this.searchPage('publishers', this.publishers[0]);
            }
        }

        var index = this.searchCriteria[type].indexOf(data._id);

        if (event.target.checked) {
            if (index === -1) {
                this.searchCriteria[type].push(data._id);
            }
        } else {
            if (index !== -1) {
                this.searchCriteria[type].splice(index, 1);
            }
        }

        this.performSearch();
    }

    searchPage(type, data) {
        this.searchCriteria[type] = [];
        this.searchCriteria[type].push(data._id);
    }

    priceChange(min, max) {
        if (min != max) {
            this.searchCriteria['price'] = {
                greater: min,
                less: max
            };
            this.performSearch();
        } else {
            delete this.searchCriteria.price;
            this.performSearch();
        }
    }

    performSearch() {
        this.searchCriteria['pageNum'] = 1;
        this.pubSubService.SearchStream.emit({ filter: this.searchCriteria });
    }

    change(tabName) {
        if (tabName == 'Filter') {
            this.priceSwitch = false;
            this.publisherSwitch = false;
            this.authorSwitch = false;
            this.categorySwitch = false;
        }
        if (tabName == 'Category') {
            this.priceSwitch = false;
            this.publisherSwitch = false;
            this.authorSwitch = false;
            if (this.categorySwitch) {
                this.categorySwitch = false;
            } else {
                this.categorySwitch = true;
            }
        }
        else if (tabName == 'Author') {
            this.categorySwitch = false;
            this.priceSwitch = false;
            this.publisherSwitch = false;
            if (this.authorSwitch) {
                this.authorSwitch = false;
            } else {
                this.authorSwitch = true;
            }
        }
        else if (tabName == 'Publisher') {
            this.categorySwitch = false;
            this.priceSwitch = false;
            this.authorSwitch = false;
            if (this.publisherSwitch) {
                this.publisherSwitch = false;
            } else {
                this.publisherSwitch = true;
            }
        }
        else if (tabName == 'price') {
            this.categorySwitch = false;
            this.publisherSwitch = false;
            this.authorSwitch = false;
            if (this.priceSwitch) {
                this.priceSwitch = false;
            } else {
                this.priceSwitch = true;
            }
        }
    }
    clearFilter(filter) {
        if (filter == 'price') {
            this.performSearch();
        }
    }
    expand() {
        this.expanded = true;
    }
}