import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { PayAfterService } from './pay-after.service';

@Component({
  selector: 'pay-after',
  templateUrl: './pay-after.html',
  encapsulation: ViewEncapsulation.None
})
export class PayAfterComponent {

  sub: any;
  message: string = '';
  is_success: boolean;
  order_info: any = {};
  previousUrl: string;

  constructor(private payAfterService: PayAfterService, private route: ActivatedRoute, private router: Router) {
  }


  ngOnInit() {
    
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        if (params['order_no']) {
          this.payAfterService.getOrderInfo(params['order_no']).subscribe(result => {
            if (result && result._id && result.payment_information && result.payment_information.status) {
              this.message = result.payment_information.message;
              this.order_info = result;
              this.is_success = result.payment_information.status == "VALID" ? true : false;
            } else {
              this.message = "System error. Please inform our customer service.";
            }
          })
        }
      });

    setTimeout(() => {
      this.router.navigateByUrl('/')
    }, 5000);

  }

}