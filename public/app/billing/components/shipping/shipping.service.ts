
import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { BaseService } from '../../../shared/services/base-service';

@Injectable()
export class ShippingService extends BaseService {

  constructor(injector: Injector) {
    super(injector);
  }

  getAddresses() {
    return this.http.get(this.apiBaseUrl + 'shipping')
      .map(res => res.json());
  }

  saveAddress(shipping) {
    return this.http.post(this.apiBaseUrl + 'shipping/', JSON.stringify(shipping), { headers: this.headers })
      .map(res => res.json());
  }

  getDistrict() {
    return this.http.get(this.apiBaseUrl + 'district').map(res => res.json())
  }

  getThana(district) {
    return this.http.get(this.apiBaseUrl + 'thana/' + district).map(res => res.json())
  }

}

