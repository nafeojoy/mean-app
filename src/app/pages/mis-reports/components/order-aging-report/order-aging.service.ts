import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class OrderAgingService extends BaseService {

    constructor(injector: Injector) {
        super(injector);
    }

    get(){
        return this.http.get(`${this.apiBaseUrl}order/mis/get-aging-data`).map(res=>res.json());
    }

    getDetail(ids, pageNo){
        return this.http.post(`${this.apiBaseUrl}order/mis/get-aging-data?pageNo=${pageNo}`, JSON.stringify(ids), {headers:this.headers})
        .map(res=>res.json());
    }


    getBooks(_id){
        return this.http.get(`${this.apiBaseUrl}order/mis/get-order-books/`+_id, { headers: this.headers })
        .map(res=>res.json());

    }

}