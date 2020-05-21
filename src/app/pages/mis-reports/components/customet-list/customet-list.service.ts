import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class CustomerListService extends BaseService {
    public publisher_id: string;
    constructor(injector: Injector) {
        super(injector);
    }

    get(pageNum, itemPerPage){
        return this.http.get(`${this.apiBaseUrl}subscriber?pageNum=${pageNum}&itemPerPage=${itemPerPage}`).map(res=>res.json());
    }

    downloanData(){
        return this.http.get(`${this.apiBaseUrl}subscriber/download`).map(res=>res.json());
    }

}