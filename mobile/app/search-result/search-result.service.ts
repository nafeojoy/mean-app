import { Injector, Injectable } from '@angular/core';

import { BaseService } from '../shared/services/base-service';

@Injectable()
export class SearchResultService extends BaseService {

    getData(term, type, page) {
        return this.http.get(this.apiBaseUrl + 'search-result/' + type + "?terms=" + term + "&pageNum=" + page).map(res => res.json());
    }

    getNewData(term) {
        return this.http.get(this.apiBaseUrl + 'product/all-search/' + term).map(res => res.json());
    }

    saveQuery(data) {
        return this.http.post(this.apiBaseUrl + 'customer-query', JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }


}