import { Injector, Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";

@Injectable()
export class BaseService {
    
    public get apiImageUploadBaseUrl() {
        return '/admin/api/';
    }

    public get publicImageBaseUrl() {
        return 'https://d1jpltibqvso3j.cloudfront.net';
    }

    public get apiBaseUrl() {
        return '/api/';
    }

    public get uploadedImageBaseUrl() {
        return 'admin/api/upload/';
    }

    public get staticImageBaseUrl() {
        return 'assets/images/';
    }

    public get sliderImageBaseUrl() {
        return 'assets/images/slider/';
    }

    protected http: Http;

    protected headers;

    constructor(injector: Injector) {
        this.http = injector.get(Http);

        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
    }
}