import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { BaseService } from '../shared/services/base-service';


@Injectable()
export class ProductDetailService extends BaseService {
    private apiPath = this.apiBaseUrl + 'product/';

    constructor(injector: Injector) {
        super(injector);
    }

    update(review) {
        return this.http.put(this.apiPath + review.product_id, JSON.stringify(review), { headers: this.headers })
            .map(res => res.json());
    }

   
}