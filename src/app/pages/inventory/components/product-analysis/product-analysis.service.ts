import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class ProductAnalysisService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    getProductDetails(){
        return this.http.get(this.apiUrl + 'product-analysis/').map(res => res.json());
    }

    getSearchedProduct(importId){
        return this.http.get(this.apiBaseUrl + 'product-analysis/' + importId).map(res=>res.json());
    }
}