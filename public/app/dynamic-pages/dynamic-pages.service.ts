import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';

import { BaseService } from '../shared/services/base-service';


@Injectable()
export class DynamicPagesService extends BaseService {
    private apiPath = this.apiBaseUrl + 'dynamic-page/';

    constructor(injector: Injector) {
        super(injector);
    }

    getPageContent(page_url) {
        return this.http.get(this.apiPath + page_url)
            .map(res => res.json());
    }

}

