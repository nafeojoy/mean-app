import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';

import { BaseService } from '../shared/services/base-service';


@Injectable()
export class CartService extends BaseService {
    private apiPath = this.apiBaseUrl + 'cart/';

    constructor(injector: Injector) {
        super(injector);
    }

    getSubscriberCart() {
        return this.http.get(this.apiPath)
            .map(res => res.json());
    }

    createCart(item: any) {
        return this.http.post(this.apiPath, JSON.stringify(item), { headers: this.headers })
            .map(res => res.json())
    }

    updateCart(cart) { 
        return this.http.put(this.apiPath + cart._id, JSON.stringify(cart), { headers: this.headers })
            .map(res => res.json());
    }

    deleteCart() {
        return this.http.delete(this.apiPath)
            .map(res => res.json());
    }

    getPromoCode(code) {
        return this.http.get(this.apiBaseUrl + 'promotional-code/' + code).map(res => res.json());
    }
}
