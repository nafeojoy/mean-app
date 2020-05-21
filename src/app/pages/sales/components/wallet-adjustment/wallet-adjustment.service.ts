import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from "@angular/http";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class WalletAdjustmentService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }
    init() {
        super.init();
        this.apiPath = 'wallet-adjustment';
    }
  

    getSubscriberSearched(terms: Observable<string>) {
        return terms.debounceTime(500)
            .distinctUntilChanged()
            .switchMap(term => this.searchSubscriber(term));
    }

    getAllWallet(){
        return this.http.get(this.apiUrl + 'wallet-list/', { headers: this.headers }).map(res => res.json()); 
    }


    searchSubscriber(searchParam){
        return this.http.get(this.apiUrl + 'subscriber-query/' + searchParam, { headers: this.headers }).map(res => res.json());        
    }
    getSubscriberWallet(id){
        return this.http.get(this.apiUrl + 'search-id/' + id, { headers: this.headers }).map(res => res.json());        
    }
    walletUpdate(data){
        return this.http.put(this.apiUrl + 'update', JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }
}