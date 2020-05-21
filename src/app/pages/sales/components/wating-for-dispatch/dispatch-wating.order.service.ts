import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class DispatchWaitingOrderService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
    }

    get(data){
       return this.http.post(this.apiBaseUrl+'dispatch-waiting-order', JSON.stringify(data), {headers: this.headers}).map(res=>res.json());
    }

    getDispatchAging(){
       return this.http.get(this.apiBaseUrl+'ready-for-dispatch/aging-data').map(res=>res.json());
     }

     getDetail(ids, pageNo){
        return this.http.post(`${this.apiBaseUrl}order/mis/get-aging-data?pageNo=${pageNo}`, JSON.stringify(ids), {headers:this.headers})
        .map(res=>res.json());
    }

    getStatus(name){
       return this.http.get(this.apiBaseUrl+'order-status/by-name/'+name).map(res=>res.json());
    }

    getCarriers(){
        return this.http.get(this.apiBaseUrl+'order-carrier').map(res=>res.json());        
    } 

    dispatch(data){
        return this.http.put(this.apiBaseUrl + 'order/send-to-dispatch/' + data.order_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    saveSplitedOrder(data){
        return this.http.post(this.apiBaseUrl + 'order/save/splited-order', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

}