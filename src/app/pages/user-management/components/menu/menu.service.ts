import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class MenuService extends BaseService {
  headers;

  constructor(injector: Injector) {
    super(injector);
  }

  init() {
    super.init();
    this.apiPath = 'menu';
  }

  getRoot() {
    return this.http.get(this.apiUrl).map(res => res.json());
  }
  
  getAll() {
    return this.http.get(this.apiUrl + 'root/childs/').map(res => res.json());
  }


  get(id) {
    return this.http.get(this.apiUrl + 'detail/' + id + '/').map(res => res.json());
  }


  getChild(id) {
    return this.http.get(this.apiUrl + id + '/').map(res => res.json());
  }

  add(menu) {
    return this.http.post(this.apiUrl, JSON.stringify(menu), { headers: this.headers })
      .map(res => res.json());
  }

  update(menu) {
    return this.http.put(this.apiUrl + menu._id, JSON.stringify(menu), { headers: this.headers })
      .map(res => res.json());
  }


  delete(menuId) {
    return this.http.delete(this.apiUrl + menuId)
      .map(res => res.json());
  }

}