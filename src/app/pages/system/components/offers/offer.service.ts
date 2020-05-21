import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class OfferService extends BaseService {
    constructor(injector: Injector) {
        super(injector)
    }

     init() {
        super.init();
        this.apiPath = 'offer';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll() {
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    add(offer) {
        return this.http.post(this.apiUrl, JSON.stringify(offer), { headers: this.headers })
            .map(res => res.json());
    }

    update(offer) {
        return this.http.put(this.apiUrl + offer._id, JSON.stringify(offer), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
