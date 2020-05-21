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

  get products() {
    return this._items;
  }


  update(product) {
    return this.http.put(this.apiBaseUrl + 'seo-update/product/' + product._id, JSON.stringify(product), { headers: this.headers }).map(res => res.json());
  }

  getAll() {
    return super.getAll();
  }

  getById(id: string) {
    return super.getById(id);
  }

  getPaged(page: number = 1, itemsPerPage: number = 10) {
    return super.getPaged(page, itemsPerPage);
  }

  search(terms: any, page: number = 1, itemsPerPage: number = 10) {
    return super.search(terms);
  }

  getSearch(terms: Observable<string>) {
    return terms.debounceTime(1000)
      .distinctUntilChanged()
      .switchMap(term => this.searchEntries(term));
  }

  searchEntries(term) {
    return this.http.get(this.apiUrl + 'search/v1?search=' + term).map(res => res.json());
  }

}