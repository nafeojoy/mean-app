import { Injector, Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { BaseService } from '../../../shared/services/base-service';
import { CookieService } from 'angular2-cookie/core';

@Injectable()
export class SubscriberViewService extends BaseService {
    private apiPath = this.apiBaseUrl + 'subscriber';

    constructor(injector: Injector, private _cookieService: CookieService) {
        super(injector);
    }

    get() {
        let myheader = new Headers();
        let token = this._cookieService.get('token');
        myheader.append('token', token);
        return this.http.get(this.apiPath, { headers: myheader }).map(res => res.json());
    }

    updatePrimaryInfo(data) {
        return this.http.put(this.apiPath, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    updateAddress(data) {
        return this.http.put(this.apiBaseUrl + 'shipping', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    saveAddress(data) {
        return this.http.post(this.apiBaseUrl + 'create-shipping-address', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    updateAddressInfo(data) {
        return this.http.put(this.apiBaseUrl + 'shipping/' + data._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getDistrict() {
        return this.http.get(this.apiBaseUrl + 'district').map(res => res.json())
    }
    
    getThana(district) {
    return this.http.get(this.apiBaseUrl + 'thana/' + district).map(res => res.json())
    }

}

