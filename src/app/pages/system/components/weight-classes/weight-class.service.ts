import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class WeightClassService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'weight-class';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll() {
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    add(weightClass) {
        return this.http.post(this.apiUrl, JSON.stringify(weightClass), { headers: this.headers })
            .map(res => res.json());
    }

    update(weightClass) {
        return this.http.put(this.apiUrl + weightClass._id, JSON.stringify(weightClass), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
