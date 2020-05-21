import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class OrderEditService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'order';
    }

    getOrderByStatus(status) {
        this.apiPath = 'order';
        return this.http.get(this.apiUrl + status)
            .map(res => res.json())
    }

    //Today's Date
    getTodayDate() {
        var now = new Date();
        var day = now.getDate();
        var month = now.getMonth() + 1; //January is 0!
        var dd = day.toString();
        var mm = month.toString();

        var yyyy = now.getFullYear();
        if (day < 10) {
            dd = '0' + dd.toString();
        }
        if (month < 10) {
            mm = '0' + mm;
        }
        var today = yyyy + '-' + mm + '-' + dd;
    }

    getById(id) {
        this.apiPath = 'order';
        return this.http.get(this.apiUrl + 'selected/' + id)
            .map(res => res.json())
    }

    update(data) {
        this.apiPath = 'order';
        return this.http.put(this.apiUrl + 'selected/' + data.order_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getActives() {
        this.apiPath = 'active-order-status';
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    updateOrder(data) {
        this.apiPath = 'order';
        return this.http.put(this.apiUrl + 'change-order/' + data._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    updatePayment(data){
        this.apiPath = 'order';
        return this.http.put(this.apiUrl + 'payment-collection/' + data.order_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }
}