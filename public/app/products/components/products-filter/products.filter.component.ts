import { Component, ViewEncapsulation, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router, NavigationEnd } from "@angular/router";
import { trigger, style, animate, transition } from '@angular/animations';

import { PubSubService } from '../../../shared/services/pub-sub-service';
import { CartService } from '../../cart.service'
import { FilterDataService } from '../../../shared/data-services/filter-data.service';


import 'style-loader!./products.filter.scss';

@Component({
    selector: 'products-filter',
    animations: [
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({ transform: 'translateY(-100%)', opacity: 0 }),
                    animate('500ms', style({ transform: 'translateY(0)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'translateY(0)', opacity: 1 }),
                    animate('500ms', style({ transform: 'translateY(100%)', opacity: 0 }))
                ])
            ]
        )
    ],
    templateUrl: './products.filter.html',
    encapsulation: ViewEncapsulation.None
})

export class ProductsFilterComponent {

    public _checkBoxData: any = {};
    private _attributes = new BehaviorSubject<any[]>([]);
    private _categories = new BehaviorSubject<any[]>([]);
    private _authors = new BehaviorSubject<any[]>([]);
    private _publishers = new BehaviorSubject<any[]>([]);
    public priceRange: any = {};

    public cat: boolean = true;
    public aut: boolean = true;
    public pub: boolean = true;
    public pri: boolean = true;
    public att: boolean = true;
    myFilterRoute: string;
    state: string;


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
    currentPageId: string = "";

    constructor(private pubSubService: PubSubService, private filterDataService: FilterDataService, private router: Router, private cartService: CartService) {

        router.events
            .filter((event) => event instanceof NavigationEnd)
            .map(() => this.router.routerState)
            .subscribe((event) => {
                this.myFilterRoute = event.snapshot.url;
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
        // console.log(data);

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
        this.searchCriteria['price'] = {
            greater: min,
            less: max
        };

        this.performSearch();
    }

    performSearch() {
        this.searchCriteria['pageNum'] = 1;
        this.pubSubService.SearchStream.emit({ filter: this.searchCriteria });
    }

    toggle(criteria) {

        if (criteria == 'cat') {
            $('#cat').slideToggle();
        }
        if (criteria == 'aut') {
            $('#aut').slideToggle();

        }
        if (criteria == 'pub') {
            $('#pub').slideToggle();

        }
        if (criteria == 'pri') {
            $('#pri').slideToggle();

        }
        if (criteria == 'att') {
            $('#pub').slideToggle();

        }
    }
}