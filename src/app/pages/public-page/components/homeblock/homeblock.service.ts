import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class HomeblockService extends BaseService {
    constructor(injector: Injector) {
        super(injector)
    }

    init() {
        super.init();
        this.apiPath = 'homeblock';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll(status) {
        return this.http.get(this.apiBaseUrl + 'homeblock?status=' + status, { headers: this.headers }).map(res => res.json());
    }

    add(homeblock) {
        return this.http.post(this.apiUrl, JSON.stringify(homeblock), { headers: this.headers })
            .map(res => res.json());
    }

    update(homeblock) {
        return this.http.put(this.apiUrl + homeblock._id, JSON.stringify(homeblock), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
