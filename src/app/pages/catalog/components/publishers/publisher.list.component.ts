import { Component, ViewEncapsulation } from "@angular/core";
import { Observable } from 'rxjs/Observable';

import { AuthManager } from "../../../../authManager";
import { PublisherService } from "./publisher.service";
import { PaginationSearchBase } from '../../../../shared/classes/pagination-search-base';

import 'style-loader!./publisher.scss';
import { AuthorService } from '../../../../../../public/app/shared/services';

@Component({
  selector: 'publishers',
  templateUrl: './publisher.list.html',
})
export class PublisherListComponent extends PaginationSearchBase {
  public apiBaseUrl: string;
  public publishers: Observable<any[]>;
  selectedPublisher: any = {};

  uploaded_image: String = '';

  constructor(
    private publisherService: PublisherService,
     public authManager: AuthManager) {
    super();
    this.apiBaseUrl = this.publisherService.apiBaseUrl;

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

  showViewModal(publisher) {
    this.selectedPublisher = publisher;
  }

  showDeleteModal(publisher) {
    this.selectedPublisher = publisher;
  }

  delete() {
    this.publisherService.delete(this.selectedPublisher._id);
  }

  set(data) {
    window.localStorage.setItem(data._id, JSON.stringify(data));
  }
}
