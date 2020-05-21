import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { BaseService } from '../../../shared/services/base-service';
import { CookieService } from 'angular2-cookie/core';

@Injectable()
export class HeaderService extends BaseService {

    public _homeContent: any;
    private apiPath = this.apiBaseUrl + '';

    constructor(injector: Injector, private _cookieService: CookieService) {
        super(injector);
    }

    getMenuContent() {
        this._homeContent = this.http.get(this.apiPath + 'layout-menu/data')
            .map(res => res.json())
            .publishReplay(1)
            .refCount();

        return this._homeContent;
    }

}