import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class ReviewService extends BaseService {
    constructor(injector: Injector) {
        super(injector)
    }

    init() {
        super.init();
        this.apiPath = 'subscriber-review';
    }

    getAll(params) {
        return this.http.post(this.apiUrl, JSON.stringify(params), {headers: this.headers}).map(res => res.json());
    }

    update(data) {
        return this.http.put(this.apiUrl + data._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    delete(data) {
        this.headers.delete('delete-data');
        this.headers.append('delete-data', data.reviews.user_id._id);
        return this.http.delete(this.apiUrl + data._id, { headers: this.headers })
            .map(res => res.json());
    }
}
