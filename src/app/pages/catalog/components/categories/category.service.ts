import { Injector, Injectable } from '@angular/core';
import { Http, Headers, Response, URLSearchParams } from "@angular/http";
import { PaginationStoreService } from '../../../../shared/services/pagination-store.service';

@Injectable()
export class CategoryService extends PaginationStoreService {

    constructor(injector: Injector) {
        super(injector);
        this.apiPath = 'categories';
        this.entityName = 'Category';
    }

    get categories() {
        return this._items;
    }

    add(category) {
        return super.add(category);
    }

    update(category) {
        return super.update(category);
    }

    delete(id) {
        return super.delete(id);
    }

    getAll() {
        return super.getAll();
    }

    getAllCats() {
        return this.http.get(this.apiUrl + 'all-cats')
            .map(res => res.json());
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