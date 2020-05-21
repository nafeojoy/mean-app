import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class DirectPayService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'payment-gateway';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll() {
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    add(directPay) {
        return this.http.post(this.apiUrl, JSON.stringify(directPay), { headers: this.headers })
            .map(res => res.json());
    }

    update(directPay) {
        return this.http.put(this.apiUrl + directPay._id, JSON.stringify(directPay), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
