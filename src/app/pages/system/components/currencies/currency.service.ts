import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class CurrencyService extends BaseService {
    constructor(injector: Injector) {
        super(injector)
    }

    init() {
        super.init();
        this.apiPath = 'currency';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll() {
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    add(currency) {
        return this.http.post(this.apiUrl, JSON.stringify(currency), { headers: this.headers })
            .map(res => res.json());
    }

    update(currency) {
        return this.http.put(this.apiUrl + currency._id, JSON.stringify(currency), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
