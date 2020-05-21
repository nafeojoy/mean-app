import { Injector, Injectable } from '@angular/core';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { BaseService } from '../../../shared/services/base-service';


@Injectable()
export class PurchaseListService extends BaseService {
    private apiPath = this.apiBaseUrl + 'content/purchases/';

    constructor(injector: Injector) {
        super(injector);
    }

    get(pageNum) {
        let paginationHeaders = new Headers();
        paginationHeaders.append('Content-Type', 'application/json');
        paginationHeaders.append('bz-pagination', pageNum);
        return this.http.get(this.apiPath, { headers: paginationHeaders })
            .map(res => res.json());
    }

    sendToSSL(data) {
        return this.http.post(this.apiBaseUrl + 'order-payment/send-to-ssl', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getGuestOrder(param) {
        let params: URLSearchParams = new URLSearchParams();
        params.set('phone_number', param.phone_number);
        params.set('order_no', param.order_no);
        return this.http.get(this.apiBaseUrl + 'content/guest-purchase?', { search: params }).map(res => res.json());
    }

}

