import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { PromotionalCodeService } from './promotional-code.service';
import { Observable } from 'rxjs/Observable';

import { PaginationSearchBase } from '../../../../shared/classes/pagination-search-base';



@Component({
    selector: 'promotional-code-list',
    templateUrl: './promotional-code.list.html',
})
export class PromotionalCodeListComponent extends PaginationSearchBase {

    public apiBaseUrl: string;
    public promotionalCodes: Observable<any[]>;
    public promoSearch: Boolean = true;

    public searchText: string;
    public total: number;

    public to_date: Date ;
    public from_date: Date;

    constructor(private promotionalCodeService: PromotionalCodeService) {
        super();
        this.apiBaseUrl = promotionalCodeService.apiBaseUrl;
        this.promotionalCodes = promotionalCodeService.promotionalCodes;
        this.totalItems = promotionalCodeService.count;

        this.searchFunction();
    }

    searchFunction() {
        this.dataSource
            .mergeMap((params: { search: string, page: number, limit: number }) => {
                if (this.to_date || this.from_date) {
                    console.log(this.to_date)
                    this.promotionalCodeService.getDatePaged(params.page, params.limit, this.from_date);
                } else if (params.page >= 1 && params.search == '') {
                    console.log("Page")
                    
                    this.searchText = '';
                    this.promotionalCodeService.getPaged();
                } else if (params.search != '') {
                    console.log("Type")
                    
                    if (params.search != undefined) {
                        this.searchText = params.search;
                    }

                    this.promotionalCodeService.getSearchPaged(params.page, params.limit, this.searchText);
                }
                return this.promotionalCodeService.promotionalCodes;
            })
            .subscribe((result) => {
                // console.log(result);
            });
    }

    ngOnInit() {
        this.promotionalCodeService.getAllPromoCodes().subscribe((res) => {
            this.total = res.count;
        })
    }
    getToDate(event) {
        this.to_date = event.dt;
        console.log(this.to_date);
    }

    getFromDate(event) {
        this.from_date = event.dt;
        console.log(this.from_date);
    }
    reset() {
        this.from_date = undefined;
        this.to_date = undefined;
    }
    show() {
        // this.promotionalCodeService.getSearchPaged()
        this.searchFunction();
    }
    toggle() {
        this.promoSearch = !this.promoSearch;
    }

    showViewModal(promotionalCodes) { }
}