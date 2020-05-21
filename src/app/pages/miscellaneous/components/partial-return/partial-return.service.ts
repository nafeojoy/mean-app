import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class PartialOrderReturnService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
    }

    getById(id) {
        return this.http.get(this.apiBaseUrl + 'order/selected/' + id).map(res => res.json())
    }

    update(data) {
        return this.http.put(this.apiBaseUrl + 'order/return-partially/' + data._id, JSON.stringify(data), { headers: this.headers }).map(res => res.json())
    }

}