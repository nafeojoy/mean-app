import { Injector, Injectable } from "@angular/core";
import { PaginationStoreService } from '../../../../shared/services/pagination-store.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ProductService extends PaginationStoreService {

  constructor(injector: Injector) {
    super(injector);
    this.apiPath = 'product';
    this.entityName = 'Product';
  }

  get(page_no) {
    return this.http.get(this.apiBaseUrl + 'product/approval/unchecked-product?page_no=' + page_no).map(res => res.json());
  }

  approve(id, action) {
    return this.http.get(this.apiBaseUrl + 'product/approval-change/' + id + '?action=' + action).map(res => res.json());
  }

  getDetail(id) {
    return this.http.get(this.apiBaseUrl + 'product/approval-detail/' + id).map(res => res.json());
  }


}