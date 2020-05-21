import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from '@angular/http';

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class BreakBundleService extends BaseService {

    constructor(injector: Injector) {
        super(injector);
    }

    getBundle(searchValue){
        console.log("searchValue");
        console.log(searchValue);
        console.log(this.apiBaseUrl+'inventory/break-bundle/'+searchValue);
        return this.http.get(this.apiBaseUrl+'inventory/break-bundle/'+searchValue).map(res=>res.json());
        
    }

}