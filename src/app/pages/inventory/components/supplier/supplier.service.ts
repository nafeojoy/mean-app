import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';
import { URLSearchParams } from '@angular/http';

@Injectable()
export class SupplierService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'supplier';
    }

    getArea() {
        return this.http.get(this.apiUrl + 'area/list').map(res => res.json())
    }

    getOrderByStatus(status) {
        return this.http.get(this.apiUrl + status)
            .map(res => res.json())
    }

    getById(id) {
        return this.http.get(this.apiUrl + 'selected/' + id)
            .map(res => res.json())
    }

    add(data) {
        return this.http.post(this.apiUrl, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    update(data) {
        return this.http.put(this.apiUrl + data._id + '/', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getAll(search) {
        let params = new URLSearchParams();
        Object.keys(search).forEach(key => {
            params.set(key, search[key]);
        })
        return this.http.get(this.apiUrl, { search: params }).map(res => res.json());
    }

    get(id) {
        return this.http.get(this.apiUrl + id, { headers: this.headers }).map(res => res.json());
    }
}
