import { Component, ViewEncapsulation } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import { CategoryService } from "./category.service";
import { AuthManager } from "../../../../authManager";

import { PaginationSearchBase } from '../../../../shared/classes/pagination-search-base';

import 'style-loader!./categorys.scss';

@Component({
  selector: 'categorys-list',
  templateUrl: './category.list.html',
})

export class CategoryListComponent extends PaginationSearchBase {
  public apiBaseUrl: string;
  public categorys: Observable<any[]>;

  selectedCategory: any = {};

  constructor(private categoryService: CategoryService, public authManager: AuthManager) {
    super();
    this.apiBaseUrl = categoryService.apiBaseUrl;

    this.categorys = this.categoryService.categorys;
    this.totalItems = this.categoryService.count;

    this.dataSource
      .mergeMap((params: { search: string, page: number, limit: number }) => {
        if (params.search && params.search.length) {
          this.categoryService.search(params.search, params.page, params.limit);
        } else {
          this.categoryService.getPaged(params.page, params.limit);
        }
        return this.categoryService.categorys;
      })
      .subscribe();
  }

  ngOnInit() {
    this.categoryService.getPaged();
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