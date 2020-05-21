
import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from "@angular/http";
import { BaseService } from '../../../../shared/services/base-service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

@Injectable()
export class ReportService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'product';
    }

    getPurchaseHistory(data) {
        return this.http.post(this.apiBaseUrl + 'purchase/purchase-history', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getPurchaseRequisitions(data){
        return this.http.post(this.apiBaseUrl + 'purchase-order/report', JSON.stringify(data), { headers: this.headers })
        .map(res => res.json());
    }


    getAllProduct(search_query) {
        let params = new URLSearchParams();
        params.set('type', search_query.item_type);
        return this.http.get(this.apiUrl + 'report/item', { search: params }).map(res => res.json());
    }

    getSaleHistory(data) {
        return this.http.post(this.apiBaseUrl + 'user/sale-history', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getStoreSales(criteria) {
        return this.http.post(this.apiBaseUrl + 'sales/daily-sales/', JSON.stringify(criteria), { headers: this.headers }).map(res => res.json());
    }

    getSaleSummary(criteria) {
        return this.http.post(this.apiBaseUrl + 'sales/sales-summary/', JSON.stringify(criteria), { headers: this.headers }).map(res => res.json());
    }

    getDailySalesInfo(criteria) {
        return this.http.post(this.apiBaseUrl + 'sales/daily-sales-info/', JSON.stringify(criteria), { headers: this.headers }).map(res => res.json());
    }

    getSaleDetails(date) {
        return this.http.get(this.apiBaseUrl + 'sales/sales-detail/' + date).map(res => res.json());
    }

    getCollectionInfo(criteria) {
        return this.http.post(this.apiBaseUrl + 'payment-collection/report', JSON.stringify(criteria), { headers: this.headers }).map(res => res.json());
    }

    getItemSearched(terms: Observable<string>) {
        return terms.debounceTime(500)
            .distinctUntilChanged()
            .switchMap(term => this.getSearchedProduct(term));
    }

    getPublisherSearched(terms: Observable<string>) {
        return terms.debounceTime(500)
            .distinctUntilChanged()
            .switchMap(term => this.getSearchedPublisher(term));
    }

    getSearchedProduct(criteria) {
        return this.http.get(this.apiBaseUrl + 'product/order-create/search/' + criteria).map(res => res.json());
    }

    getSearchedPublisher(criteria) {
        return this.http.get(this.apiBaseUrl + 'publisher/search-name/'+criteria).map(res => res.json());
    }

    getInventorySummary(criteria) {
        return this.http.post(this.apiBaseUrl + 'inventory/sales-summary/', JSON.stringify(criteria), { headers: this.headers }).map(res => res.json());
    }

    getOrderSummary(criteria) {
        return this.http.post(this.apiBaseUrl + 'order/order-summary/', JSON.stringify(criteria), { headers: this.headers }).map(res => res.json());
    }
    // =======================================
    saveResData(data) {
        return this.http.post(this.apiBaseUrl + 'dashboard-temp', JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }

    getPurchaseOrderData(id) {
        return this.http.get(this.apiBaseUrl + 'purchase-order/order-detail/' + id).map(res => res.json());
    }

    getStockHistory(data){
        return this.http.post(this.apiBaseUrl + 'stock/stock-report', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }
    // ==============================
    addCommentToStock(data){
        return this.http.put(this.apiBaseUrl + 'stock/stock-comment/'+data._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getStockItemComments(id){
        return this.http.get(this.apiBaseUrl + 'stock/stock-comment/' + id).map(res => res.json());
    }

    getDailyStock(search_query){

        let params = new URLSearchParams();
        params.set('date_from', search_query.from_date);
        //params.set('date_to', search_query.to_date);

        return this.http.get(this.apiBaseUrl+ 'stock/daily-stock/', {search: params}).map(res => res.json());
    
        // return this.http.post(this.apiBaseUrl + 'stock/daily-stock/', JSON.stringify(search_query), { headers: this.headers })
        // .map(res => res.json());
    }

    getBookListOfOrder(){
        return this.http.get(this.apiBaseUrl + 'order/confirmed-order/book-list').map(res => res.json());
    }
}
