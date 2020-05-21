import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { ModalDirective } from 'ngx-bootstrap';

import { PaymentService } from './payment.service';
import { AuthService } from '../../../shared/services/auth.service';
import { CookieService } from 'angular2-cookie/core';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { BuyNowDataService } from '../../../shared/data-services/buy-now-data.service';
import { StaticPagesService } from '../../../shared/services/static-pages.service';

import { MessageService } from './message.service';

import 'style-loader!./payment.scss';

@Component({
  selector: 'payment-process',
  providers: [CartService],
  templateUrl: './payment.html',
  encapsulation: ViewEncapsulation.None
})
export class PaymentComponent {

  @ViewChild('termsPolicyModal') termsPolicyModal: ModalDirective;


  public isAgree: boolean = false;
  message: string;
  public wrappingCharge: number = 0;
  public discount: number = 0;
  public promo_id: any = {};

  payment_data: any = {};
  public alerts: any = [];
  public content_object: any = {};
  public total_book: number = 0;


  public staticImageBaseUrl: string;
  public pMethods: any = [
    { name: "Cash on Delivery", val: "cash-on-delivery" },
    { name: "Debit/Credit Card", val: "debit-credit-card" },
    { name: "Mobile Banking", val: "mobile-banking" },
    { name: "Internet Banking", val: "internet-banking" },
  ];
  public pMethod: any = {};
  public res_pending: boolean;
  public userFirstname: string;

  constructor(private cartService: CartService, private paymentService: PaymentService, private buyNowDataService: BuyNowDataService,
    private _cookieService: CookieService,
    private pubSubService: PubSubService, private router: Router, private messageService: MessageService, private authService: AuthService, private staticPagesService: StaticPagesService) {
    this.staticImageBaseUrl = this.paymentService.staticImageBaseUrl;
  }

  ngOnInit() {

    this.pMethod.method = "cash-on-delivery";
    this.userFirstname = this.authService.getUserFirstname();
    this.pubSubService.AuthStatusStream.subscribe((result) => {
      if (result.redirectToHome === true) {
        this.router.navigate(['/']);
      }
    });

    this.cartService.getSubscriberCart().subscribe((result) => {

      for (let i = 0; i < result.cart.products.length; i++) {
        this.total_book = this.total_book + result.cart.products[i].quantity;
      }
      this.wrappingCharge = result.cart.wrapping_charge;
      this.discount = result.cart.discount;
      this.promo_id = result.cart.promo_id;
    });

  }

  saveOrder(isAgree) {
    if (isAgree) {
      this.res_pending = true;
      let order_params: any = {}
      if (this.authService.isLoggedIn() === true) {
        let ordered_cart = window.localStorage.getItem('presentCart');
        let shipping_address = window.localStorage.getItem('presentAddress');
        if (ordered_cart == null || shipping_address == null) {
          this.alerts.push({
            type: 'danger',
            msg: 'You may not loggedIn or incorrectly processed your shopping',
            timeout: 5000
          });
        } else {
          order_params.cart_id = ordered_cart;
          order_params.address_id = shipping_address;
          order_params.total_price = this.payment_data.total_price;
          order_params.delivery_charge = this.payment_data.delivery_charge;
          order_params.wrapping_charge = this.wrappingCharge;
          order_params.discount = this.discount;
          order_params.promo_id = this.promo_id;
          order_params.payable_amount = this.payment_data.total;
          order_params.total_book = this.total_book;          

          this.paymentService.saveOrder(order_params).subscribe((response) => {
            if (response.status == 200) {
              window.localStorage.removeItem('presentCart');
              window.localStorage.removeItem('presentAddress');
              this._cookieService.remove('cart_id');
              this.pubSubService.CartStream.emit({ paymentCompelete: true });
              let res_order = response.data;
              if (this.pMethod.method == 'cash-on-delivery') {
                this.router.navigate(['/'], { queryParams: { ors: response.data.order_no } });
              } else {
                let sslData = {
                  amount: this.payment_data.total,
                  order_id: res_order.order_no,
                  name: res_order.delivery_address.contact_name,
                  email: this.authService.getUserEmail() ? this.authService.getUserEmail()[0] : "info@boibazar.com",
                  address: res_order.delivery_address.address,
                  district: res_order.delivery_address.district,
                  thana: res_order.delivery_address.thana,
                  phone_number: res_order.delivery_address.phone_number
                }
                this.payWithSSL(sslData);
              }
              // let message_text = "Dear " + res_order.delivery_address.contact_name + " Your order has been receieved successfully. Your Order ID is " + res_order.order_no + " One of our customer representative will call you soon. Thank You";
              // let data = "user=boibazar&pass=35@7L19j&sid=BoiBazarBrand&sms[0][0]=88" + res_order.delivery_address.phone_number + "&sms[0][1]=" + message_text + "&sms[0][2]=1234567891"
              // this.messageService.sendMessage(data).subscribe((res) => {
              // })
            } else {
              this.res_pending = false;
              this.alerts.push({
                type: 'danger',
                msg: response.message,
                timeout: 5000
              });
            }
          })
        }
      } else {
        let address = JSON.parse(window.localStorage.getItem('tempAddress'));
        if (address && address.contact_name) {
          order_params.delivery_address = address;
          order_params.total_price = this.payment_data.total_price;
          order_params.delivery_charge = this.payment_data.delivery_charge;
          order_params.wrapping_charge = this.wrappingCharge;
          order_params.discount = this.discount;
          order_params.promo_id = this.promo_id;
          order_params.payable_amount = this.payment_data.total;
          order_params.total_book = this.total_book;                    

          this.paymentService.saveGuestOrder(order_params).subscribe((response) => {
            if (response.status == 200) {
              window.localStorage.removeItem('tempAddress');
              this._cookieService.remove('cart_id');
              this.pubSubService.CartStream.emit({ paymentCompelete: true });
              let res_order = response.data;
              if (this.pMethod.method == 'cash-on-delivery') {
                this.router.navigate(['/'], { queryParams: { ors: response.data.order_no } });
              } else {
                let sslData = {
                  amount: this.payment_data.total,
                  order_id: res_order.order_no,
                  name: res_order.delivery_address.contact_name,
                  email: "info@boibazar.com",
                  address: res_order.delivery_address.address,
                  district: res_order.delivery_address.district,
                  thana: res_order.delivery_address.thana,
                  phone_number: res_order.delivery_address.phone_number
                }
                this.payWithSSL(sslData);
              }
              // let message_text = "Dear " + res_order.delivery_address.contact_name + " Your order has been receieved successfully. Your Order ID is " + res_order.order_no + " One of our customer representative will call you soon.To see your order status visit this link http://m.boibazar.com/contents/purchase-list .Thank You";
              // let data = "user=boibazar&pass=35@7L19j&sid=BoiBazarBrand&sms[0][0]=88" + res_order.delivery_address.phone_number + "&sms[0][1]=" + message_text + "&sms[0][2]=1234567891"
              // this.messageService.sendMessage(data).subscribe((res) => {
              // })
            } else {
              this.res_pending = false;
              this.alerts.push({
                type: 'danger',
                msg: 'Order submit failed!',
                timeout: 5000
              });
            }
          })
        }
      }
    }
  }

  promotionalCodeUpdate() {

  }

  payWithSSL(data) {
    this.paymentService.sendToSSL(data).subscribe((sslRes) => {
      if (sslRes && sslRes.status == "SUCCESS") {
        //Promo PUT
        window.location.href = sslRes.GatewayPageURL;
      }
    })
  }

  getPayableAmount(payable_amount) {
    this.payment_data = payable_amount;
  }

  ngOnDestroy() {
    this.buyNowDataService.dataSource = null;
  }

  showModaldata(content_url) {
    this.termsPolicyModal.show();
    this.staticPagesService.get(content_url).subscribe(result => {
      this.content_object = result;
    });
  }

  onHidden() {
    this.termsPolicyModal.hide();
  }

}