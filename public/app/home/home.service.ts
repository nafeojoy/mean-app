import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { CookieService } from 'angular2-cookie/core';
import { Jsonp } from '@angular/http';

import 'rxjs/add/operator/publishReplay';
import { Observable } from 'rxjs/Observable';

import { BaseService } from '../shared/services/base-service';

@Injectable()
export class HomeService extends BaseService {
    private apiPath = this.apiBaseUrl + '';

    //private _homeContent: Observable<any> = null;
    public _homeContent: any = {};
    public searchCriteria: any = {}


    constructor(injector: Injector, private _cookieService: CookieService, private jsonp: Jsonp) {
        super(injector);
    }

    getPageContent() {
        let language = this._cookieService.get('lang');

        if (!this._homeContent[language]) {
            this._homeContent[language] = this.http.get(this.apiPath + 'home-content')
                .map(res => res.json())
                .publishReplay(1)
                .refCount();
        }
        return this._homeContent[language];
    }

    public gotoPage(url, page) {

        let requestUrl = this.apiBaseUrl + url;
        let language = this._cookieService.get('lang');
        if (!this.searchCriteria[language + url + page]) {
            this.searchCriteria[language + url + page] = {};
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('bz-pagination', page);
            this.searchCriteria[language + url + page] = this.http.get(requestUrl, { headers: headers })
                .map(res => res.json())
                .publishReplay(1)
                .refCount();
        }
        return this.searchCriteria[language + url + page];
    }

    trackUservisit(data) {
        return this.http.post(this.apiPath + 'visitor-track', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getSliderImages() {
        return this.http.get(this.apiPath + 'active-slider-images').map(res=>res.json())
    }

    getExternalIp() {
        var json = 'https://ipv4.myexternalip.com/json';
        return this.http.get(json).map(res => res.json())
    }

    getIp() {
        return this.jsonp.get('//api.ipify.org/?format=jsonp&callback=JSONP_CALLBACK').map(res => res.json())
    }

}