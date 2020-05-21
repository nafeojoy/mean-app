import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { BaseService } from '../shared/services/base-service';


@Injectable()
export class PubliserPageService extends BaseService {
    private apiPath = this.apiBaseUrl + 'publishers/';

    constructor(injector: Injector) {
        super(injector);
    }

    getPublisher(text) {
        return this.http.get(this.apiPath + text)
            .map(res => res.json());
    }

    update(review) {
        return this.http.put(this.apiPath + 'user-review/' + review.publisher_id, JSON.stringify(review), { headers: this.headers })
            .map(res => res.json());
    }

}