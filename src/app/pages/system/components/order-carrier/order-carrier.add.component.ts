import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { OrderCarrierService } from "./order-carrier.service";
import 'style-loader!./order-carrier.scss';

@Component({
  selector: 'order-carrier-add',
  templateUrl: './order-carrier.add.html',
  styleUrls: ['./order-carrier.scss'],
})
export class OrderCarrierAddComponent {

  public orderCarrier: any = {};
  public alerts: any = [];
  public isDisabled: boolean = false;
  public isSubmited: boolean;
  constructor(private orderCarrierService: OrderCarrierService, private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {
    this.orderCarrier.is_enabled = true;
  }


  addOrderCarrier() {
    this.isDisabled = true;
    this.isSubmited = true;
    if (this.orderCarrier.name && this.orderCarrier.name != '' && this.orderCarrier.phone && this.orderCarrier.phone != '' && this.orderCarrier.address && this.orderCarrier.address != '') {
      this.orderCarrierService.add(this.orderCarrier).subscribe(result => {
        if (result.success) {
          this.isSubmited = false;
          this.orderCarrier = { is_enabled: true };
          setTimeout((router: Router) => {
            this.location.back();
            this.isDisabled = false;
          }, 2000);
          this.alerts.push({
            type: 'info',
            msg: 'New OrderCarrier add ',
            timeout: 4000
          });
        } else {
          this.isDisabled = false;
          this.alerts.push({
            type: 'danger',
            msg: 'Something went wrong. Try Again',
            timeout: 4000
          });
        }
      })
    } else {
      this.isDisabled = false;
      this.isSubmited = true;
    }
  }

  back() {
    this.location.back();
  }

}