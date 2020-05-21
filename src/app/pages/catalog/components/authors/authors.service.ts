import { Injector, Injectable } from "@angular/core";
import { Http, Headers, Response, URLSearchParams } from "@angular/http";
import { PaginationStoreService } from '../../../../shared/services/pagination-store.service';

@Injectable()
export class AuthorService extends PaginationStoreService {

  constructor(injector: Injector) {
    super(injector);
  }

  init() {
    super.init();
    this.apiPath = 'author';
    this.entityName = 'Author';
  }

  get authors() {
    return this._items;
  }

  add(author) {
    return super.add(author);
  }

  update(author) {
    return super.update(author);
  }

  delete(id) {
    return super.delete(id);
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

  getSearch(searchTerms) {
    let params = new URLSearchParams();
    params.set('search', searchTerms);
    return this.http.get(this.apiUrl + 'search/v1', { search: params })
      .map(res => res.json());
  }
}
