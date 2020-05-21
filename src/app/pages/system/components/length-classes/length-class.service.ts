import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class LengthClassService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'length-class';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll() {
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    add(lengthClass) {
        return this.http.post(this.apiUrl, JSON.stringify(lengthClass), { headers: this.headers })
            .map(res => res.json());
    }

    update(lengthClass) {
        return this.http.put(this.apiUrl + lengthClass._id, JSON.stringify(lengthClass), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
