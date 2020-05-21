import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { BaseService } from './base-service';


@Injectable()
export class PublisherService extends BaseService {
    private apiUrl = this.apiBaseUrl + 'publisher';

    constructor(injector: Injector) {
        super(injector);
    }

    public get() {
        return this.http.get(this.apiUrl).map(res => res.json());
    }
}