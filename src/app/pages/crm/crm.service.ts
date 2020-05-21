import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../shared/services/base-service';

@Injectable()
export class CRMService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'call-record';
    }

    getCustomerOrderByPhone(phone_number) {
        return this.http.get(this.apiBaseUrl + 'order/order_by_phone/' + phone_number).map(res => res.json())
    }

    getInfo(phone_number) {
        return this.http.get(this.apiUrl + phone_number).map(res => res.json())
    }

    saveRecord(data) {
        return this.http.post(this.apiUrl, JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }

    getDistrict() {
        return this.http.get(this.publicApiBaseUrl + 'district').map(res => res.json())
    }

    getThana(district) {
        return this.http.get(this.publicApiBaseUrl + 'thana/' + district).map(res => res.json())
    }

    add(data) {
        return this.http.post(this.apiBaseUrl + 'order', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    saveAddress(shipping) {
        return this.http.post(this.apiBaseUrl + 'shipping/', JSON.stringify(shipping), { headers: this.headers })
            .map(res => res.json());
    }

    updateAddress(shipping) {
        return this.http.put(this.apiBaseUrl + 'shipping/' + shipping._id, JSON.stringify(shipping), { headers: this.headers })
            .map(res => res.json());
    }

    getSearchedSubscriber(criteria) {
        return this.http.get(this.apiBaseUrl + 'shipping-address/search/' + criteria).map(res => res.json());
    }

    // Using Public API
    getSearched(criteria) {
        return this.http.get(this.apiBaseUrl + 'product/order-create/search/' + criteria).map(res => res.json());
    }

    getSubscrAddress(sub_id) {
        return this.http.get(this.apiBaseUrl + 'shipping/' + sub_id).map(res => res.json());
    }

    signup(item: any) {
        return this.http.post(this.publicApiBaseUrl + 'auth/signup', JSON.stringify(item), { headers: this.headers })
            .map(res => res.json());
    }

    getPayementGatewayes() {
        return this.http.get(this.apiBaseUrl + 'payment-gateway').map(res => res.json());
    }

    getCarriers() {
        return this.http.get(this.apiBaseUrl + 'order-carrier').map(res => res.json());
    }

    savePayment(data) {
        return this.http.post(this.apiBaseUrl + 'payment-collect', JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }

    recodForBookQuery(data){
        return this.http.post(this.apiUrl+'customer/book-query', JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }

}