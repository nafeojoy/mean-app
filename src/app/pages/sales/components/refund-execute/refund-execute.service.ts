import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from "@angular/http";
import { BaseService } from '../../../../shared/services/base-service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';


@Injectable()
export class RefundExecuteService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }
    init() {
        super.init();
        this.apiPath = 'refund-execute';
    }

    getSearchedRefund(criteria) {
        return this.http.post(this.apiUrl + 'refund-list/', JSON.stringify(criteria), { headers: this.headers }).map(res => res.json());
    }

    getRefund(id) {
        return this.http.get(this.apiUrl + id, { headers: this.headers }).map(res => res.json());
    }
    executeRefund(data) {
        return this.http.put(this.apiUrl + 'update', JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }




}