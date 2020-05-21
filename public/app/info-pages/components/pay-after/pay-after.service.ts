import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { BaseService } from '../../../shared/services/base-service';

@Injectable()
export class PayAfterService extends BaseService {
    private apiPath = this.apiBaseUrl + 'order-payment/';

    constructor(injector: Injector) {
        super(injector);
    }

    getOrderInfo(order_no) {
        return this.http.get(this.apiPath + order_no)
            .map(res => res.json());
    }
}