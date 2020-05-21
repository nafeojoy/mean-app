import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { BaseService } from './base-service';


@Injectable()
export class StaticPagesService extends BaseService {
    private apiPath = this.apiBaseUrl + 'static-content';

    constructor(injector: Injector) {
        super(injector);
    }

    get(url) {
        return this.http.get(this.apiPath + '/' + url)
            .map(res => res.json());
    }

    postFeedback(item: any) {
        return this.http.post(this.apiBaseUrl + 'customer-feedback', JSON.stringify(item), { headers: this.headers })
            .map(res => res.json())
    }

    verifyToken(token) {
        return this.http.get('/api/subscriber/verify/' + token).map(res => res.json());
    }
}