import { Injector, Injectable } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class PurchaseAcceptService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'purchase-accept';
    }

    hasTerm: string = '';
    getTerm() {
        return this.hasTerm;
    }

    getOrderByStatus(status) {
        return this.http.get(this.apiUrl + status)
            .map(res => res.json())
    }

    getById(id) {
        return this.http.get(this.apiUrl + 'selected/' + id)
            .map(res => res.json())
    }

    add(data) {
        return this.http.post(this.apiUrl, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    update(data) {
        return this.http.put(this.apiUrl + data._id + '/', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    updateProductPurchaseHistory(data){
        return this.http.put(this.apiUrl  + 'product-purchase-history/' + data.item_id, JSON.stringify(data), { headers: this.headers})
            .map(res=> res.json())
    }

    getAll(pageNum) {
        return this.http.get(this.apiUrl + '?pageNum=' + pageNum, { headers: this.headers }).map(res => res.json());
    }

    get(id) {
        return this.http.get(this.apiUrl + id + '/', { headers: this.headers }).map(res => res.json());
    }

    getProductSearched(terms: Observable<string>) {
        return terms.debounceTime(1000)
            .distinctUntilChanged()
            .switchMap(term => this.getSearched(term));
    }

    getSearched(criteria) {
        return this.http.get(this.apiBaseUrl+'product/soundex-enabled-search/' + criteria).map(res => res.json());
    }

    getSupplier() {
        return this.http.get(this.apiBaseUrl+'publishers').map(res => res.json())
    }

    getItemSearched(terms: Observable<string>) {
        return terms.debounceTime(500)
            .distinctUntilChanged()
            .switchMap(term => this.getSearchedProduct(term));
    }

    getSupplierSearched(terms: Observable<string>) {
        return terms.debounceTime(500)
            .distinctUntilChanged()
            .switchMap(term => this.getSearchedSupplier(term));
    }

    getSearchedProduct(criteria) {
        return this.http.get(this.apiBaseUrl + 'product/purchase/search/' + criteria).map(res => res.json());
    }

    getSearchedSupplier(criteria) {
        this.hasTerm = criteria;
        return this.http.get(this.apiBaseUrl + 'supplier/search/' + criteria).map(res => res.json());
    }

    searchPurchase(data) {
        return this.http.post(this.apiBaseUrl + 'purchase/search', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getItemByUrl(seo_url) {
        return this.http.get(this.apiBaseUrl + 'product/order-create/search-by-seo/' + seo_url).map(res => res.json());
    }

    getSearchedAuthor(criteria) {
        return this.http.get(this.apiBaseUrl + 'author/order-create/author-search/' + criteria).map(res => res.json());
    }
}
