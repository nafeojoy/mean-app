import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { PaginationBase } from './pagination-base';

export class PaginationSearchBase extends PaginationBase {
    protected searchTermStream = new Subject<string>();
    protected searchTerms: string = '';

    protected searchSource: any;
    protected dataSource: any;

    constructor() {
        super();

        this.searchSource = this.searchTermStream
            .debounceTime(1000)
            .distinctUntilChanged()
            .map(searchTerm => {
                this.searchTerms = searchTerm
                return { search: searchTerm, page: this.currentPage, limit: this.itemsPerPage }
            });

        this.dataSource = this.pageSource
            .merge(this.searchSource)
            .startWith({ search: this.searchTerms, page: this.currentPage, limit: this.itemsPerPage })
    }

    search(terms: string) {
        this.searchTermStream.next(terms)
    }
}