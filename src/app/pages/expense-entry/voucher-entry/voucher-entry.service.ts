import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../shared/services/base-service';

@Injectable()
export class VoucherEntryService extends BaseService {

    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'voucher-entry';
    }

    getAll(pageNo) {
        return this.http.get(this.apiUrl + '?pageNo=' + pageNo).map(res => res.json());
    }

    addCostCenter(data) {
        return this.http.post(this.apiBaseUrl + 'cost-center', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    get(id) {
        return this.http.get(this.apiUrl + id).map(res => res.json());
    }

    getLeafAccountAndCost() {
        return this.http.get(this.apiBaseUrl + 'chart-of-account/leaf-account-and-cost/list').map(res => res.json());
    }

    add(data) {
        return this.http.post(this.apiUrl, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    update(data) {
        return this.http.put(this.apiUrl + data._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

}