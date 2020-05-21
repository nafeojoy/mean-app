import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class PaymentCollectionService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
    }
    
    getPayementGatewayes() {
        return this.http.get(this.apiBaseUrl + 'payment-gateway').map(res => res.json());
    }

    getCarriers() {
        return this.http.get(this.apiBaseUrl + 'order-carrier').map(res => res.json());
    }

    getOrdersByCarriers(id) {
        return this.http.get(this.apiBaseUrl + 'order-list-by-carrier/' + id).map(res => res.json());
    }

    getOrdersByOrderNo(order_no) {
        return this.http.get(this.apiBaseUrl + 'order/getorder-by-orderno/' + order_no).map(res => res.json());
    }

    getPaidOrdersByOrderNo(order_no) {
        return this.http.get(this.apiBaseUrl + 'order/get-paid-order-by-orderno/' + order_no).map(res => res.json());
    }

    saveRefund(data) {
        return this.http.post(this.apiBaseUrl + 'bkash/grant-refund', JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }

    save(data) {
        return this.http.post(this.apiBaseUrl + 'payment-collect', JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }

    updateTransaction(data) {
        return this.http.post(this.apiBaseUrl + 'payment-collection/update-transaction-for-carrier-collection', JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }

    getUunpaidCarrOrder(id){
        return this.http.get(this.apiBaseUrl + 'unpaid-carriar-cost-order/' + id).map(res => res.json());        
    }

    updateCarrCost(data){
        return this.http.post(this.apiBaseUrl + 'update-carriar-cost-order', JSON.stringify(data), { headers: this.headers }).map(res => res.json());        
    }

    updateCarrierCost(data){
        return this.http.post(this.apiBaseUrl + 'payment-collection/update-transaction-for-carrier-payment', JSON.stringify(data), { headers: this.headers }).map(res => res.json());        
    }

    getCollectableOrder(id){
        return this.http.get(this.apiBaseUrl + 'payment-collection/collectable-orders/' + id).map(res => res.json());
    }

    excelColelction(data){
        return this.http.post(this.apiBaseUrl + 'payment-collection/upload-excel', JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }

}