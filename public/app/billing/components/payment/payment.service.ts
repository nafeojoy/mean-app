import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { BaseService } from '../../../shared/services/base-service';

@Injectable()
export class PaymentService extends BaseService {

  constructor(injector: Injector) {
    super(injector);
  }

  saveOrder(order) {
    return this.http.post(this.apiBaseUrl + 'order/', JSON.stringify(order), { headers: this.headers })
      .map(res => res.json());
  }

  saveGuestOrder(order) {
    return this.http.post(this.apiBaseUrl + 'guest-order/', JSON.stringify(order), { headers: this.headers })
      .map(res => res.json());
  }

  sendToSSL(data) {
    return this.http.post(this.apiBaseUrl + 'order-payment/send-to-ssl', JSON.stringify(data), { headers: this.headers })
    .map(res => res.json());
  }

}