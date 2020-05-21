import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class PurchaseRequisitionCreateService extends BaseService {
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

    getAll(pageNum) {
        let params = new URLSearchParams();
        params.set('pageNum', pageNum);
        return this.http.get(this.apiUrl, { search: params }).map(res => res.json())
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

    addEmployee(data) {
        return this.http.post(this.apiBaseUrl+'employee', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }
}