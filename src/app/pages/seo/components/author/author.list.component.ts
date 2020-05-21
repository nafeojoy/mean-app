import { Component, ViewEncapsulation } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import { AuthorService } from "./author.service";
import { AuthManager } from "../../../../authManager";

import { PaginationSearchBase } from '../../../../shared/classes/pagination-search-base';

import 'style-loader!./authors.scss';

@Component({
  selector: 'authors-list',
  templateUrl: './author.list.html',
})

export class AuthorListComponent extends PaginationSearchBase {
  public apiBaseUrl: string;
  public authors: Observable<any[]>;

  selectedAuthor: any = {};

  constructor(private authorService: AuthorService, public authManager: AuthManager) {
    super();
    this.apiBaseUrl = authorService.apiBaseUrl;

    this.authors = this.authorService.authors;
    this.totalItems = this.authorService.count;

    this.dataSource
      .mergeMap((params: { search: string, page: number, limit: number }) => {
        if (params.search && params.search.length) {
          this.authorService.search(params.search, params.page, params.limit);
        } else {
          this.authorService.getPaged(params.page, params.limit);
        }
        return this.authorService.authors;
      })
      .subscribe();
  }

  ngOnInit() {
    this.authorService.getPaged();
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