import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class SearchDataService {

  public dataSource: any;
  public termsSource: string;
  public searching_on: string;

  setData(data: any) {
    this.dataSource = data;
  };

  setTerms(terms: string) {
    this.termsSource = terms;
  }

  setSearchOn(search_on) {
    this.searching_on = search_on;
  }

  getSearchOn() {
    return this.searching_on;
  }

}


