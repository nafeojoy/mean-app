import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { BaseService } from '../../../shared/services/base-service';

@Injectable()
export class CustomerReviewService extends BaseService {
    private apiPath = this.apiBaseUrl + 'product/';

    constructor(injector: Injector) {
        super(injector);
    }

    update(data) {
        return this.http.put(this.apiPath + data.product_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    updateReview(data) {
        return this.http.put(this.apiPath + 'update-review/' + data.product_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }
}

