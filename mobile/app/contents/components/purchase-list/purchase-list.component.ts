import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';


import { PurchaseListService } from './purchase-list.service';
import { AuthService } from '../../../shared/services/auth.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import 'style-loader!./purchase.scss';

@Component({
  selector: 'purchase-list',
  providers: [PurchaseListService],
  templateUrl: './purchase-list.html',
  encapsulation: ViewEncapsulation.None
})

export class PurchaseListComponent {

  @ViewChild('termsPolicyModal') termsPolicyModal: ModalDirective;

  public purchases: any = [];
  public products: any = [];
  public totalItems: number = 0;
  public busy: Subscription;
  public res_pending: boolean;

  public orderNo: number;
  public bookTotal: number;
  public deliveryCharge: number;
  public wrappingCharge: number;
  public discount: number;
  public productList: any = [];



  private subAuthStatusStream: any;
  private subLanguageStream: any;
  public currentPage: number = 1;
  public maxSize: number = 5;
  public itemsPerPage: number = 8;
  public isChange: boolean = true;
  public showDetails: boolean = false;
  profileStateExpression: string;

  public isLoggedIn: boolean;
  public purchaseQuery: any = {};
  public captcha_valid: boolean;
  public search_err_message: string;
  public guest_purchase_info: any = {};
  public is_search_submitted: boolean;

  public date: Date;
  public day: number;
  public month: number;
  public year: number;

  public countCall: number = 0;
  
  constructor(private purchaseListService: PurchaseListService, private authService: AuthService,
    private pubSubService: PubSubService, private router: Router) { }

  ngOnInit() {
    if (this.authService.isLoggedIn() === true) {
      this.isLoggedIn = true;
      this.getPurchase();
      this.pubSubService.LanguageStream.subscribe((result) => {
        this.getPurchase();
      });
    } else {
      this.isLoggedIn = false;
    }

    //Redirect to Home after Log-out 
    this.subAuthStatusStream = this.pubSubService.AuthStatusStream.subscribe((result) => {
      if (result.redirectToHome === true) {
        this.router.navigate(['/',]);
      }
    });
  }


  handleCorrectCaptcha(event) {
    this.res_pending = true;
    if (event && event != '') {
      this.authService.validateCaptcha(event).subscribe(result => {
        this.res_pending = false;
        this.captcha_valid = result.success;
      })
    }
  }

  getPurchase() {
    // let pageNum = 1
    this.busy = this.purchaseListService.get(this.currentPage).subscribe(result => {
      this.totalItems = result.count;
      this.purchases = result.histories;
      // window.scrollTo(0, 0);
    })
  }

  setPage(): void {
    this.currentPage - this.currentPage;
    this.getPurchase();
  }
  removeItem(index) {
    this.purchases.splice(index, 1);
    // console.log(this.purchases);
    // this.updatePurchase(this.purchases);
  }
  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  paynow(data) {

    let sslData;
    if (data.payable_amount) {
      sslData = {
        amount: data.payable_amount,
        order_id: data.order_no,
        name: data.delivery_address.contact_name,
        email: this.authService.getUserEmail() ? this.authService.getUserEmail()[0] : "info.boibazar.com",
        address: data.delivery_address.address,
        district: data.delivery_address.district,
        thana: data.delivery_address.thana,
        phone_number: data.delivery_address.phone_number
      }
    } else {
      sslData = {
        amount: (data.total_price + data.wrapping_charge + data.discount_charge - data.discount),
        order_id: data.order_no,
        name: data.delivery_address.contact_name,
        email: this.authService.getUserEmail() ? this.authService.getUserEmail()[0] : "info.boibazar.com",
        address: data.delivery_address.address,
        district: data.delivery_address.district,
        thana: data.delivery_address.thana,
        phone_number: data.delivery_address.phone_number
      }
    }

    this.payWithSSL(sslData);
  }

  payWithSSL(data) {
    this.res_pending = true;
    this.purchaseListService.sendToSSL(data).subscribe((sslRes) => {
      if (sslRes && sslRes.status == "SUCCESS") {
        window.location.href = sslRes.GatewayPageURL;
      } else {
        this.router.navigateByUrl('/info/pay-after?order_no=' + data.order_no);
      }
    })
  }

  getOrderStatus(statusName) {
    if (statusName == 'Pending') return '#f0ad4e';
    if (statusName == 'Inshipment') return '#db8000';
    if (statusName == 'Delivered') return 'Green';
    if (statusName == 'Confirmed') return 'Green';
    if (statusName == 'Cancelled') return 'Red';
    if (statusName == 'OrderClosed') return 'Green';
  }

  showModaldata(purchase) {
    this.termsPolicyModal.show();

    this.orderNo = purchase.order_no;
    this.bookTotal = purchase.total_price;
    this.deliveryCharge = purchase.delivery_charge;
    this.wrappingCharge = purchase.wrapping_charge;
    this.discount = purchase.discount;

    this.productList = purchase.products;

  }
  onHidden() {
    this.termsPolicyModal.hide();
  }


  getGuestPurchase() {
    this.search_err_message = '';
    this.guest_purchase_info = {};
    this.purchaseListService.getGuestOrder(this.purchaseQuery).subscribe(result => {
      if (result.status) {
        this.guest_purchase_info = result.info;
      } else {
        this.search_err_message = result.message;
        this.is_search_submitted = true;
        setTimeout(() => {
          this.search_err_message = '';
          this.is_search_submitted = false;
        }, 5000)
      }
    })
  }
  dateConvert(date) {
    this.date = date.split("-");
    this.day = this.date[2].slice(0, 2);
    this.month = this.date[1];
    this.year = this.date[0];
    this.countCall++;
  }

}