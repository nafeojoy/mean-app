import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class GiftService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'gift';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll() {
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    getActives() {
        this.apiPath = 'active-gift';
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    add(gift) {
        return this.http.post(this.apiUrl, JSON.stringify(gift), { headers: this.headers })
            .map(res => res.json());
    }

    update(gift) {
        return this.http.put(this.apiUrl + gift._id, JSON.stringify(gift), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
