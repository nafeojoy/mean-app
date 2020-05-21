import { Component, ViewEncapsulation } from "@angular/core";
import { Observable } from 'rxjs/Observable';

import { AuthManager } from "../../../../authManager";
import { PublisherService } from "./publisher.service";
import { PaginationSearchBase } from '../../../../shared/classes/pagination-search-base';
import { ExcelService } from '../../../../shared/services/excel-export.service';

import 'style-loader!./publisher.scss';

@Component({
  selector: 'publishers',
  templateUrl: './publisher.list.html',
})
export class PublisherListComponent extends PaginationSearchBase {
  public apiBaseUrl: string;
  public publishers: Observable<any[]>;
  selectedPublisher: any = {};

  uploaded_image: String = '';

  constructor(private publisherService: PublisherService, private _excelService: ExcelService, public authManager: AuthManager) {
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

  export(data) {
    this.publisherService.getBookInfo(data._id).subscribe(output => {

     // console.log(output);
      

      if (output.success) {
        this._excelService.exportAsExcelFile(output.books, 'publisher_book')
      } else {
        alert(output.message)
      }
    })
  }
}
