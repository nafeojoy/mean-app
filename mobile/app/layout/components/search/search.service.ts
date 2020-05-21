import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';


import { BaseService } from '../../../shared/services/base-service';
import { SearchDataService } from '../../../shared/data-services/searched-data.service';

@Injectable()
export class SearchService extends BaseService {
    private apiPath = this.apiBaseUrl + 'product/';

    constructor(injector: Injector, private searchDataService: SearchDataService) {
        super(injector);
    }

    getSearched(terms: Observable<string>) {
        return terms.debounceTime(500)
            .distinctUntilChanged()
            .switchMap(term => this.searchEntries(term));
    }

    type: any;
    term: any;
    setType(value) {
        this.type = value;
    }

    searchEntries(term) {
        this.searchDataService.setTerms(term);
        this.term = term;
        return this.http
            .get(this.apiPath + 'all-search/' + this.type + '/?term=' + term)
            .map(res => res.json());
    }

    searchButon() {
        this.searchDataService.setTerms(this.term)
        return this.http
            .get(this.apiPath + 'all-search/' + this.type + '/?term=' + this.term)
            .map(res => res.json());
    }

}
