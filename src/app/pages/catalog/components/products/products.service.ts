import { Injector, Injectable } from "@angular/core";
import { PaginationStoreService } from '../../../../shared/services/pagination-store.service';
import { Observable } from 'rxjs/Observable';
import { URLSearchParams, Headers } from "@angular/http";

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

  getOffers() {
    return this.http.get(this.apiBaseUrl + 'offer')
      .map(res => res.json())
  }

  add(product) {
    return super.add(product);
  }

  update(product) {
    return super.update(product);
  }

  delete(id) {
    return super.delete(id);
  }

  getAllProduct(pageNum) {
    let paginationHeaders = new Headers();
    paginationHeaders.append('Content-Type', 'application/json');
    paginationHeaders.append('bz-pagination', pageNum + ',' + 10);
    return this.http.get(this.apiUrl, { headers: paginationHeaders }).map(res => res.json());
  }

  getById(id: string) {
    return super.getById(id);
  }

  getPaged(page: number = 1, itemsPerPage: number = 10) {
    return super.getPaged(page, itemsPerPage);
  }
  getSearchPaged(page: number = 1, itemsPerPage: number = 10, terms: any) {
    return super.getProductSearchPaged(page, itemsPerPage, terms);
  }
  search(terms: any, page: number = 1, itemsPerPage: number = 10) {
    return super.search(terms);
  }

  getProductByCategory(categoryId: string) {
    return this.http.get(this.apiUrl + 'category/' + categoryId)
      .map(res => res.json());
  }

  getSearchOtherData(criteria) {
    return this.http.post(this.apiBaseUrl + 'product-search', JSON.stringify(criteria), { headers: this.headers }).map(res => res.json());
  }

  getSearchNameData(criteria) {
    let paginationHeaders = new Headers();
    paginationHeaders.append('Content-Type', 'application/json');
    paginationHeaders.append('bz-pagination', criteria.pageNum + ',' + 10);
    return this.http.get(this.apiBaseUrl + 'product-search?bname='+criteria.book_name, { headers: paginationHeaders }).map(res => res.json());
  }


  getSearch(terms: Observable<string>) {
    return terms.debounceTime(1000)
      .distinctUntilChanged()
      .switchMap(term => this.searchEntries(term));
  }

  searchEntries(term) {
    return this.http.get(this.apiUrl + 'search/v1?search=' + term).map(res => res.json());
  }

  updatePreviewPageState(data) {
    return this.http.put(this.apiUrl + 'preview-page-state/' + data.id, JSON.stringify(data), { headers: this.headers }).map(res => res.json());
  }

  getDownloadData(criterion) {
    return this.http.post(this.apiBaseUrl + 'product-export/search-result', JSON.stringify(criterion), { headers: this.headers })
      .map(res => res.json());
  }

}