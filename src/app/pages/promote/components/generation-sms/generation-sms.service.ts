import { Injectable, Injector } from "@angular/core";
import { Http, Headers, RequestOptions, URLSearchParams } from "@angular/http";
import { BaseService } from 'app/shared/services/base-service';
@Injectable()
export class GenerationSmsService extends BaseService {
    headers;
    constructor(injector: Injector, http: Http) {
        super(injector)
    }


    getSearchedPromos(criteria) {
        return this.http.get('/admin/api/promotional-code/search/' + criteria).map(res => res.json());
    }
    addToSmsGeneration(data) {
        // console.log(JSON.stringify(data));
        return this.http.post('/admin/api/sms-generation/', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }
    // addToBulk(data) {
    //     return this.http.post('/admin/api/bulk-sms-log/', JSON.stringify(data), { headers: this.headers })
    //         .map(res => res.json());
    // }
    getById(id) {
        this.apiPath = '/admin/api/sms-generation/';
        return this.http.get(this.apiPath + id).map(res => res.json())
    }
    messageAdd(msg) {
        return this.http.post('/admin/api/message-template/', JSON.stringify(msg), { headers: this.headers })
            .map(res => res.json());
    }
    getMessages() {
        // this.apiPath = 'active-order-status';
        return this.http.get('/admin/api/message-template/', { headers: this.headers }).map(res => res.json());
    }

    getSmsByType(type) {
        return this.http.get('/admin/api/sms-generation/type/' + type)
            .map(res => res.json())
    }
    update(data) {
        console.log(data);

        this.apiPath = '/admin/api/sms-generation/edit/';
        return this.http.put(this.apiPath  + data._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }
    sendSms(data) {
        console.log(data);

        this.apiPath = '/admin/api/sms-generation/';
        return this.http.put(this.apiPath  + data._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }
    cancel(data) {
        console.log(data);

        this.apiPath = '/admin/api/sms-generation/cancel/';
        return this.http.put(this.apiPath  + data._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }
}

