import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class BuyNowDataService {

  public dataSource: any;

  setData(data: any) {
    this.dataSource = data;
  };
}


