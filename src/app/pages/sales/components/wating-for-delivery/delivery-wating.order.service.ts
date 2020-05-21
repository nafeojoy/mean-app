import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class DeliveryWaitingOrderService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
    }

    getOrder(criteria) {
        return this.http.post(this.apiBaseUrl + 'delivery-waiting-order', JSON.stringify(criteria), { headers: this.headers }).map(res => res.json());
    }

    getCarriers() {
        return this.http.get(this.apiBaseUrl + 'order-carrier').map(res => res.json());
    }

    getStatus(name) {
        return this.http.get(this.apiBaseUrl + 'order-status/by-name/' + name).map(res => res.json());
    }

    delivery(data) {
        return this.http.put(this.apiBaseUrl + 'order/change-order-status/' + data.order_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    saveSplitedOrder(data) {
        return this.http.post(this.apiBaseUrl + 'order/save/splited-order', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

}