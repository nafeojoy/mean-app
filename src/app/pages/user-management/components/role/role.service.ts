import { Injector, Injectable } from "@angular/core";
import { TreeviewItem } from '../../../../tree';
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class RoleService extends BaseService {

  constructor(injector: Injector) {
    super(injector);
  }

  init() {
    super.init();
    this.apiPath = 'role';
  }

  getAll() {
    return this.http.get(this.apiUrl).map(res => res.json());
  }

  get(id) {
    return this.http.get(this.apiUrl + id + '/').map(res => res.json());
  }

  add(role) {
    return this.http.post(this.apiUrl, JSON.stringify(role), { headers: this.headers })
      .map(res => res.json());
  }

  update(role) {
    return this.http.put(this.apiUrl + role._id, JSON.stringify(role), { headers: this.headers })
      .map(res => res.json());
  }

  delete(roleId) {
    return this.http.delete(this.apiUrl + roleId)
      .map(res => res.json());
  }

}