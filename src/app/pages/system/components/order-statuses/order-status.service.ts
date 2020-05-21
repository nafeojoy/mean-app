import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class OrderStatusService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'order-status';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll() {
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    getActives() {
        this.apiPath = 'active-order-status';
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    add(orderStatus) {
        return this.http.post(this.apiUrl, JSON.stringify(orderStatus), { headers: this.headers })
            .map(res => res.json());
    }

    update(orderStatus) {
        return this.http.put(this.apiUrl + orderStatus._id, JSON.stringify(orderStatus), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
