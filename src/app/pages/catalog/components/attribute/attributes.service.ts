import { Injector, Injectable } from "@angular/core";
import { Http, Headers, Response, URLSearchParams } from "@angular/http";
import { PaginationStoreService } from '../../../../shared/services/pagination-store.service';

@Injectable()
export class AttributesService extends PaginationStoreService {
    public attributes_id: string;
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'attributes';
        this.entityName = 'Attributes';
    }

    get attributes() {
        return this.http.get(this.apiUrl).map(res => res.json());
    }

    addAttribute(attributes) {
        return this.http.post(this.apiUrl, JSON.stringify(attributes), { headers: this.headers }).map(res => res.json());
    }

    update(attributes) {
        return super.update(attributes);
    }

    delete(id) {
        return super.delete(id);
    }

    getAll() {
        this.attributes_id = null;
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

}