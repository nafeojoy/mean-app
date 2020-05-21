import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class PromotionalImageService extends BaseService {
    constructor(injector: Injector) {
        super(injector)
    }

     init() {
        super.init();
        this.apiPath = 'promotional-image';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll() {
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    add(promotional) {
        return this.http.post(this.apiUrl, JSON.stringify(promotional), { headers: this.headers })
            .map(res => res.json());
    }

    update(promotional) {
        return this.http.put(this.apiUrl + promotional._id, JSON.stringify(promotional), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
