import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from "@angular/http";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class RefundRequestService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }
    init() {
        super.init();
        this.apiPath = 'refund-request';
    }
  

    getRefundSearched(terms: Observable<string>) {
        return terms.debounceTime(500)
            .distinctUntilChanged()
            .switchMap(term => this.searchRefund(term));
    }

     addRefundRequest(data){
        return this.http.post(this.apiUrl, JSON.stringify(data), { headers: this.headers })
        .map(res => res.json());
    }
    getAllRefund(){
        return this.http.get(this.apiUrl + 'refund-list/', { headers: this.headers }).map(res => res.json()); 
    }


    searchRefund(searchParam){
        return this.http.get(this.apiUrl + 'refund-query/' + searchParam, { headers: this.headers }).map(res => res.json());        
    }


}