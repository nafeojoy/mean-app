import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../shared/services/base-service';

@Injectable()
export class ChartOfAccountService extends BaseService {

    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'chart-of-account';
    }

    getRoot() {
        return this.http.get(this.apiUrl).map(res => res.json());
    }


    getChild(id) {
        return this.http.get(this.apiUrl + id + '/').map(res => res.json());
    }

    get(id) {
        return this.http.get(this.apiUrl + 'detail/' + id + '/').map(res => res.json());
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