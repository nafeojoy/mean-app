import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from '@angular/http';

import { BaseService } from '../../shared/services/base-service';

@Injectable()
export class AccountReportService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'account-report';
    }

    getPurchaseData(data) {
        return this.http.post(this.apiUrl + 'purchase', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getStock(data) {
        return this.http.post(this.apiUrl + 'stock', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }


    getExpenses(data) {
        return this.http.post(this.apiUrl + 'expense', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }


    getCollection(data) {
        return this.http.post(this.apiUrl + 'payment-collection/collection-report', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

}