import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class StaticContentService extends BaseService {
    constructor(injector: Injector) {
        super(injector)
    }

    init() {
        super.init();
        this.apiPath = 'static-content';
    }

    getAll() {
        return this.http.get(this.apiUrl).map(res => res.json())
    }

    getById(id) {
        return this.http.get(this.apiUrl + id).map(res => res.json())
    }

    add(data) {
        return this.http.post(this.apiUrl, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    update(data) {
        return this.http.put(this.apiUrl + data._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }

}