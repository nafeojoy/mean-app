import { Component, ViewEncapsulation } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { AuthManager } from "../../../../authManager";
import { AttributesService } from "./attributes.service";
import { PaginationSearchBase } from '../../../../shared/classes/pagination-search-base';

import 'style-loader!./attributes.scss';

@Component({
  selector: 'attributes',
  templateUrl: './attributes.list.html',
})
export class AttributesListComponent {
  
  public attributes: Observable<any[]>;
  selectedattributes: any = {};

  constructor(private attributesService: AttributesService, public authManager: AuthManager) {}

  ngOnInit() {
    this.attributes = this.attributesService.attributes;
    for (var key in localStorage) {
      if (key.length == 24) {
          localStorage.removeItem(key);
      }
  }
  }

  showDeleteModal(attributes) {
    this.selectedattributes = attributes;
  }

  delete() {
    this.attributesService.delete(this.selectedattributes._id);
  }

  set(data) {
    window.localStorage.setItem(data._id, JSON.stringify(data));
  }

}
