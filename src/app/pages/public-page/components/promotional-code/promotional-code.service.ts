import { Injector, Injectable } from "@angular/core";
import { PaginationStoreService } from '../../../../shared/services/pagination-store.service';
import { Observable } from 'rxjs/Observable';



@Injectable()
export class PromotionalCodeService extends PaginationStoreService {
    constructor(injector: Injector) {
        super(injector);
        this.apiPath = 'promotional-code';
        this.entityName = 'PromotionalCode';
    }

    get promotionalCodes() {
        return this._items;
    }


    add(promotionalCodes) {
        return super.add(promotionalCodes);
    }
    update(promotionalCodes) {
        return super.update(promotionalCodes);
    }
    delete(id) {
        return super.delete(id);
    }

    getAll() {
        return super.getAll();
    }
    getById(id) {
        return this.http.get(this.apiUrl + id).map(res => res.json())
    }
    getPaged(page: number = 1, itemsPerPage: number = 10) {
        return super.getPaged(page, itemsPerPage);
    }

    getSearchPaged(page: number = 1, itemsPerPage: number = 10, terms: any) {
        return super.getSearchPaged(page, itemsPerPage, terms);
    }
    getDatePaged(page: number = 1, itemsPerPage: number = 10, from_date: any){
        return super.getDatePaged(page, itemsPerPage, from_date);
    }
    search(terms: any, page: number = 1, itemsPerPage: number = 10) {
        return super.search(terms);
    }


    getSearch(terms: Observable<string>) {
        return terms.debounceTime(1000)
            .distinctUntilChanged()
            .switchMap(term => this.searchEntries(term));
    }

    searchEntries(term) {
        return this.http.get(this.apiUrl + 'search/v1?search=' + term).map(res => res.json());
    }

    getAllPromoCodes() {
        return this.http.get(this.apiUrl).map(res => res.json());

    }



}