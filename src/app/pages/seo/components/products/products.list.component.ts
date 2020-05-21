import { Component, ViewEncapsulation } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import { ProductService } from "./products.service";
import { CategoryService } from "../categories/category.service";
import { AuthManager } from "../../../../authManager";

import { PaginationSearchBase } from '../../../../shared/classes/pagination-search-base';

import 'style-loader!./products.scss';

@Component({
  selector: 'products-list',
  templateUrl: './products.list.html',
})

export class ProductListComponent extends PaginationSearchBase {
  public apiBaseUrl: string;
  public products: Observable<any[]>;

  selectedProduct: any = {};

  constructor(private productService: ProductService, public authManager: AuthManager) {
    super();
    this.apiBaseUrl = productService.apiBaseUrl;

    this.products = this.productService.products;
    this.totalItems = this.productService.count;

    this.dataSource
      .mergeMap((params: { search: string, page: number, limit: number }) => {
        if (params.search && params.search.length) {
          this.productService.search(params.search, params.page, params.limit);
        } else {
          this.productService.getPaged(params.page, params.limit);
        }
        return this.productService.products;
      })
      .subscribe();
  }

  ngOnInit() {
    this.productService.getPaged();
    for (var key in localStorage) {
      if (key.length == 24) {
        localStorage.removeItem(key);
      }
    }
  }

  set(data) {
    window.localStorage.setItem(data._id, JSON.stringify(data));
  }

}