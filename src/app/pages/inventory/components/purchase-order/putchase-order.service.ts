import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class PurchaseOrderService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'purchase-order';
    }

    hasTerm: string = '';
    getTerm() {
        return this.hasTerm;
    }

    getAll(data) {
        let params = new URLSearchParams();
        params.set('pageNum', data.pageNo);
        params.set('status', data.status);
        return this.http.get(this.apiUrl, { search: params }).map(res => res.json())
    }

    getPendingPurchaseBookList(data) {
        return this.http.post(this.apiUrl + 'pending/book-list', JSON.stringify(data), { headers: this.headers }).map(res => res.json())
    }

    getById(id) {
        return this.http.get(this.apiUrl + 'to-update/' + id).map(res => res.json())
    }

    get(order_no) {
        return this.http.get(this.apiUrl + order_no).map(res => res.json())
    }

    getOrderByStatus(status) {
        return this.http.get(this.apiBaseUrl + 'order/not-purchase-order/' + status)
            .map(res => res.json())
    }

    getSelectedOrderItemsStatus(data) {
        return this.http.post(this.apiBaseUrl + 'order/selected-order', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json())
    }

    add(data) {
        return this.http.post(this.apiUrl, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json())
    }

    update(data) {
        return this.http.put(this.apiUrl + 'to-update/' + data._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json())
    }

    updateOrderOnly(data) {
        return this.http.put(this.apiUrl + 'update-corder/', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json())
    }

    getEmployeeSearched(terms: Observable<string>) {
        return terms.debounceTime(500)
            .distinctUntilChanged()
            .switchMap(term => this.getSearchedEmployee(term));
    }

    getSearchedEmployee(criteria) {
        this.hasTerm = criteria;
        return this.http.get(this.apiBaseUrl + 'employee/search/' + criteria).map(res => res.json());
    }

    getItemByUrl(seo_url) {
        return this.http.get(this.apiBaseUrl + 'order/selected-product/stock-info?seo=' + seo_url).map(res => res.json());
    }

    getProductSearched(terms: Observable<string>) {
        return terms.debounceTime(1000)
            .distinctUntilChanged()
            .switchMap(term => this.getSearched(term));
    }

    // Using Public API
    getSearched(criteria) {
        let url = this.apiBaseUrl + 'product/order-create/search/' + criteria;
        return this.http.get(url).map(res => res.json());
    }

    getSelectedBookOrders(id) {
        return this.http.get(this.apiBaseUrl + 'purchase-order/selected-book/' + id).map(res => res.json());
    }

    getSearchedAuthor(criteria) {
        return this.http.get(this.apiBaseUrl + 'author/order-create/author-search/' + criteria).map(res => res.json());
    }

    getPublisherSearched(terms: Observable<string>) {
        return terms.debounceTime(1000)
            .distinctUntilChanged()
            .switchMap(term => this.getSearchedPublisher(term));
    }

    getSearchedPublisher(criteria) {
        return this.http.get(this.apiBaseUrl + 'publisher/order-create/publisher-search/' + criteria).map(res => res.json());
    }

    getPublisherBook(name) {
        return this.http.get(this.apiBaseUrl + 'order/product-list/by-publisher?name=' + name).map(res => res.json());
    }

    getProductStockInfo(id) {
        return this.http.get(this.apiBaseUrl + 'order/selected-product/stock-info?id=' + id).map(res => res.json());
    }

    saveStatus(data) {
        return this.http.post(this.apiBaseUrl + 'purchase-order/update/purchase-status', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getSupplierSearched(terms: Observable<string>) {
        return terms.debounceTime(500)
            .distinctUntilChanged()
            .switchMap(term => this.getSearchedSupplier(term));
    }

    getSearchedSupplier(criteria) {
        this.hasTerm = criteria;
        return this.http.get(this.apiBaseUrl + 'supplier/search/' + criteria).map(res => res.json());
    }

    purchasePendingBook(data) {
        return this.http.post(this.apiBaseUrl + 'purchase/partial/pending-books', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }
}