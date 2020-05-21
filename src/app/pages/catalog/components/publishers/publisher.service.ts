import { Injector, Injectable } from "@angular/core";
import { Http, Headers, Response, URLSearchParams } from "@angular/http";
import { PaginationStoreService } from '../../../../shared/services/pagination-store.service';

@Injectable()
export class PublisherService extends PaginationStoreService {
    public publisher_id: string;
    constructor(injector: Injector) {
        super(injector);
        this.apiPath = 'publisher';
        this.entityName = 'Publisher';
    }

    get publishers() {
        return this._items;
    }

    add(publisher) {
        return super.add(publisher);
    }

    update(publisher) {
        return super.update(publisher);
    }

    delete(id) {
        return super.delete(id);
    }

    getAll() {
        this.publisher_id = null;
        return super.getAll();
    }

    getById(id: string) {
        return super.getById(id);
    }

    getPaged(page: number = 1, itemsPerPage: number = 10) {
        return super.getPaged(page, itemsPerPage);
    }

    search(terms: any, page: number = 1, itemsPerPage: number = 10) {
        return super.search(terms);
    }

    getSearch(searchTerms) {
        let params = new URLSearchParams();
        params.set('search', searchTerms);
        return this.http.get(this.apiUrl + 'search/v1', { search: params })
            .map(res => res.json());
    }

    setId(id) {
        this.publisher_id = id;
    }
    
    checkExists(text) {
        let params = new URLSearchParams();
        if (this.publisher_id) {
            params.set('id', this.publisher_id);
            return this.http.get(this.apiUrl + 'check-page-url/' + text, { search: params })
                .map(res => res.json());
        } else {
            return this.http.get(this.apiUrl + 'check-page-url/' + text)
                .map(res => res.json());
        }
    }

}