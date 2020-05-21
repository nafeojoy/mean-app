import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class UserService extends BaseService {

  constructor(injector: Injector) {
    super(injector);
    this.apiPath = 'user';
  }


  getAll() {
    return this.http.get(this.apiUrl).map(res => res.json())
  }

  add(user) {
    return this.http.post('/admin/api/auth/signup', JSON.stringify(user), { headers: this.headers })
      .map(res => res.json());
  }

  get(id) {
    return this.http.get(this.apiUrl + id + '/').map(res => res.json())
  }

  delete(userId) {
    return this.http.delete(this.apiUrl + userId).map(res => res.json());
  }

  update(user) {
    return this.http.put(this.apiUrl + user._id + '/', JSON.stringify(user), { headers: this.headers })
      .map(res => res.json());
  }

}