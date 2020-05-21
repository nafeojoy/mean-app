import { Injectable } from "@angular/core";
import { Jsonp } from '@angular/http';

import { Http, Headers, RequestOptions, URLSearchParams } from "@angular/http";
@Injectable()
export class HomeService {
    headers;
    constructor(private http: Http, private jsonp: Jsonp) {
    }

    getIp() {
        return this.jsonp.get('//api.ipify.org/?format=jsonp&callback=JSONP_CALLBACK').map(res => res.json())
    }
}
