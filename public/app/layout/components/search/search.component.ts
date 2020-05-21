import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from "@angular/router";
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { CookieService } from 'angular2-cookie/core';
import { Subscription } from 'rxjs';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { SearchService } from './search.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { FilterDataService } from '../../../shared/data-services/filter-data.service';
import { SearchDataService } from '../../../shared/data-services/searched-data.service';


import { ActivatedRoute } from "@angular/router"

import 'style-loader!./search.scss';

@Component({
    selector: 'app-search',
    templateUrl: './search.html',
    encapsulation: ViewEncapsulation.None
})
export class SearchComponent {

    cssClass: string = 'search-nomargin';
    cssId: string = 'search-box-h';
    cssSearchId: string = 'search-button-h';
    cssFilterId: string = 'search-filter-h';

    myroute: string;

    results: Object;
    searchTerm$ = new Subject<string>();
    searchType: any = "products";
    public busy: Subscription;
    dataList: Array<any> = [];
    show_image: boolean = true;
    mobHeight: any;
    mobWidth: any;
    selectStyle: string;
    selectStyleLow: string;

    checkLoad: boolean = false;

    searchItems = [
        { name: "All", val: "products" },
        { name: "Author", val: "authors" },
        { name: "Category", val: "categories" },
        { name: "Publisher", val: "publishers" }
    ]

    constructor(private searchService: SearchService, private router: Router, private searchDataService: SearchDataService,
        private location: Location, private pubSubService: PubSubService, private filterDataService: FilterDataService) {

        this.mobHeight = (window.screen.height);
        this.mobWidth = (window.screen.width);
        if (this.mobWidth <= 1098) {
            this.selectStyle = "btn btn-default dropdown-toggle select-style-lowest";
        }
        else if (this.mobWidth <= 1280 && this.mobWidth > 1098) {
            this.selectStyle = "btn btn-default dropdown-toggle select-style-low";
        } else {
            this.selectStyle = "btn btn-default dropdown-toggle select-style";
        }
        this.searchService.setType(this.searchType);
        this.searchDataService.setSearchOn(this.searchType);
        router.events
            .filter((event) => event instanceof NavigationEnd)
            .map(() => this.router.routerState)
            .subscribe((event) => {

                this.myroute = event.snapshot.url;

                if (this.myroute == '/categories') {
                    this.searchType = 'categories';
                    this.searchService.setType(this.searchType);
                    this.searchDataService.setSearchOn(this.searchType);
                }
                if (this.myroute == '/authors') {
                    this.searchType = "authors";
                    this.searchService.setType(this.searchType);
                    this.searchDataService.setSearchOn(this.searchType);
                }
                if (this.myroute == '/publishers') {
                    this.searchType = "publishers";
                    this.searchService.setType(this.searchType);
                    this.searchDataService.setSearchOn(this.searchType);
                }

                if (this.myroute == '/') {
                    this.cssClass = 'search-margin';
                    this.cssId = 'search-box-h';
                    this.cssSearchId = 'search-button-h';
                    this.cssFilterId = 'search-filter-h';
                }
                else if (this.myroute == '/?login=true') {
                    this.cssClass = 'search-margin';
                    this.cssId = 'search-box-h';
                    this.cssSearchId = 'search-button-h';
                    this.cssFilterId = 'search-filter-h';

                }
                else {
                    this.cssClass = 'search-nomargin';
                    this.cssId = 'search-box';
                    this.cssSearchId = 'search-button';
                    this.cssFilterId = 'search-filter';


                }

            });

        this.searchService.getSearched(this.searchTerm$)
            .subscribe(results => {
                $("#searchBox").css({
                    "box-shadow": "unset",
                    'background-image': 'unset',
                    'background-repeat': 'unset',
                    'background-position': 'unset',
                    'background-size': 'unset'
                });


                let search_text = this.searchDataService.termsSource;

                if (results.length < 12 && search_text.length != 0) {
                    var temp = results;
                    var data = this.dataList;
                    this.dataList = [];
                    this.dataList = temp.concat(data);
                    var obj = {};
                    for (var i = 0, len = this.dataList.length; i < len; i++)
                        obj[this.dataList[i]['_id']] = this.dataList[i];
                    this.dataList = new Array();
                    for (var key in obj)
                        this.dataList.push(obj[key]);
                } else {
                    this.dataList = results;
                }

                this.searchDataService.setData(this.dataList);
                this.pubSubService.SearchStream.emit({ dataList: this.dataList })
                this.checkLoad = true;
            });

    }

    ngOnInit() {

    }

    changeSearchItems(search_on) {
        // console.log("changeSearchItems")

        this.searchType = search_on;
        this.searchService.setType(this.searchType);
        this.searchDataService.setSearchOn(search_on);
    }

    getSelected(item) {
        // console.log("Before")

        this.filterDataService.removeBreadcrumbData();
        this.router.navigate(['../../../', item.click_url, item.seo_url]);
        this.pubSubService.SearchStream.emit({ search: item.seo_url, search_type: item.click_url });
    }

    searchedProducts() {
        // console.log("Before")
        this.busy = this.searchService.searchButon().subscribe(values => {
            // console.log("After")

            $("#searchBox").css({
                "box-shadow": "unset",
                'background-image': 'unset',
                'background-repeat': 'unset',
                'background-position': 'unset',
                'background-size': 'unset'
            });
            // console.log("search - searchedProducts")
            this.searchDataService.setData(values);
            this.router.navigateByUrl('/search');
            this.pubSubService.SearchStream.emit({ dataList: values });
        })
    }

}