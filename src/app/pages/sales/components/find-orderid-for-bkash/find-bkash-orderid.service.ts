import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from '@angular/http';

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class FindBkashService extends BaseService {

    constructor(injector: Injector) {
        super(injector);
        //this.apiPath = 'product';
    }

    getOrderId(transactionId){
        
        return this.http.get(this.apiBaseUrl+'sales/bkash-to-orderid/'+transactionId).map(res=>res.json());
    }

    // getOrderIdOfBkash(data){
    //     console.log(this.apiBaseUrl+'sales/bkashToOrderId/'+data);
    //     return this.http.put(this.apiBaseUrl+'sales/bkashToOrderId/' + data);
    //   }


}