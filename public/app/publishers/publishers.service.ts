import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { BaseService } from '../shared/services/base-service';


@Injectable()
export class PublisherListService extends BaseService {
    private apiPath = this.apiBaseUrl + 'publishers';

    constructor(injector: Injector) {
        super(injector);
    }

    get(page) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('bz-pagination', page);
        return this.http.get(this.apiPath, { headers: headers })
            .map(res => res.json());
    }
}