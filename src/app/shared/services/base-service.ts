import { Injector, Injectable } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class BaseService {
    private _apiPrefix = '/admin/api/';
    protected apiPath = '';

    public get apiBaseUrl() {
        return this._apiPrefix;
    }

    public get publicApiBaseUrl() {
        return '/api/';
    }

    public get uploadApiBaseUrl() {
        return 'http://admin.boibazar.com:3000/upload/api/';
    }

    protected get apiUrl() {
        return this._apiPrefix + this.apiPath + '/';
    }

    protected http: Http;
    // protected notificationsService: NotificationsService

    protected headers;

    constructor(protected injector: Injector) {
        this.http = injector.get(Http);
        // this.notificationsService = injector.get(NotificationsService);
        this.init();
    }

    init() {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
    }
}