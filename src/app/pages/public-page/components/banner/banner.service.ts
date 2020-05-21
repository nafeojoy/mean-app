import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class BannerService extends BaseService {
    

   

    constructor(injector: Injector) {
        super(injector)
    }

    init() {
        super.init();
        this.apiPath = 'banner';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll(status) {
        return this.http.get(this.apiBaseUrl + 'banner?status=' + status, { headers: this.headers }).map(res => res.json());
    }

    add(banner) {
        return this.http.post(this.apiUrl, JSON.stringify(banner), { headers: this.headers })
            .map(res => res.json());
    }

    update(banner) {
        return this.http.put(this.apiUrl + banner._id, JSON.stringify(banner), { headers: this.headers })
            .map(res => res.json());
    }

    cacheClear(){
        return this.http.put(this.apiUrl + 'redis-flush' ,  { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
