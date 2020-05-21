import { Component, ViewEncapsulation } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import { PublisherService } from "./publisher.service";
import { CategoryService } from "../categories/category.service";
import { AuthManager } from "../../../../authManager";

import { PaginationSearchBase } from '../../../../shared/classes/pagination-search-base';

import 'style-loader!./publishers.scss';

@Component({
  selector: 'publishers-list',
  templateUrl: './publisher.list.html',
})

export class PublisherListComponent extends PaginationSearchBase {
  public apiBaseUrl: string;
  public publishers: Observable<any[]>;

  selectedPublisher: any = {};

  constructor(private publisherService: PublisherService, public authManager: AuthManager) {
    super();
    this.apiBaseUrl = publisherService.apiBaseUrl;

    this.publishers = this.publisherService.publishers;
    this.totalItems = this.publisherService.count;

    this.dataSource
      .mergeMap((params: { search: string, page: number, limit: number }) => {
        if (params.search && params.search.length) {
          this.publisherService.search(params.search, params.page, params.limit);
        } else {
          this.publisherService.getPaged(params.page, params.limit);
        }
        return this.publisherService.publishers;
      })
      .subscribe();
  }

  ngOnInit() {
    this.publisherService.getPaged();
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