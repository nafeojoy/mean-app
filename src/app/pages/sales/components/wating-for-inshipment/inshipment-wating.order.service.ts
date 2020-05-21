import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class InshipmentWaitingOrderService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
    }

    get(data){
       return this.http.post(this.apiBaseUrl+'inshipment-waiting-order', JSON.stringify(data), {headers:this.headers}).map(res=>res.json());
    }

    getCarriers(){
       return this.http.get(this.apiBaseUrl+'order-carrier').map(res=>res.json());        
    }

    getStatus(name){
       return this.http.get(this.apiBaseUrl+'order-status/by-name/'+name).map(res=>res.json());
    }

    inshipment(data){
        return this.http.put(this.apiBaseUrl + 'order/change-order-status/' + data.order_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    saveSplitedOrder(data){
        return this.http.post(this.apiBaseUrl + 'order/save/splited-order', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

}