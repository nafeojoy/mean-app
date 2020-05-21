import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CookieService } from 'angular2-cookie/core';

import { CartService } from './cart.service';
import { AuthService } from '../../../shared/services/auth.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';

import 'style-loader!./cart.scss';


@Component({
  selector: 'cart-process',
  providers: [CartService],
  templateUrl: './cart.html',
  encapsulation: ViewEncapsulation.None
})

export class CartComponent {

  public busy: Subscription;
  private subAuthStatusStream: any;
  private subLanguageStream: any;

  public cart: any = {};
  public subTotal: number = 0;
  public mainTotal: number = 0;

  public disc: number = 0;
  public deliveryCharge: number = 0;
  discount: number = 0;
  public isTrue: boolean;
  public isChecked: Boolean = false;
  public wrappingCharge: number = 0;
  promo_code: string;
  discount_parcent: number = 0;
  errorMsg: String;
  public hasItemInCart: boolean;
  public similar_product: any;
  public staticImageBaseUrl: string = this.cartService.staticImageBaseUrl;
  is_free_shipping: boolean;

  added_promo: any;

  constructor(public cartService: CartService, private authService: AuthService,
    private pubSubService: PubSubService, private router: Router, private _cookieService: CookieService) { }


  ngOnInit() {
    this.getCart();
    this.subAuthStatusStream = this.pubSubService.AuthStatusStream.subscribe((result) => {
      if (result.redirectToHome === true) {
        this.router.navigate(['/',]);
      }
    });
    this.subLanguageStream = this.pubSubService.LanguageStream.subscribe((result) => {
      this.getCart();
    });
  }

  toggle() {
    if (!this.isChecked) {
      this.wrappingCharge = 15;
      this.isChecked = true;
      this.giftWrap();
    }
    else {
      this.wrappingCharge = 0;
      this.isChecked = false;
      this.giftWrap();
    }
    this.mainTotal = 0;
    this.subTotal = 0;
  }

  discountCheck(promo) {
    this.cartService.getPromoCode(promo).subscribe(result => {
      if (result.data == undefined) {
        this.promo_code = null;

        this.errorMsg = result.message;
        this.discount = 0;
        this.discount_parcent = 0;
        this.cart.discount = this.discount;
        this.cart.promo_id = undefined;
        this.updateCart(this.cart);
      }
      else {
        this.promo_code = promo;

        this.added_promo = result.data;
        this.errorMsg = "";
        this.discount_parcent = result.data.discount;
        this.discount = Math.ceil(this.subTotal * (result.data.discount / 100));

        this.cart.discount = this.discount;
        this.cart.promo_id = result.data._id;
        this.updateCart(this.cart);
      }
    })

  }

  removeDiscount() {
    this.discount = 0;
    this.discount_parcent = 0;
    this.cart.discount = this.discount;
    this.cart.promo_id = undefined;
    this.promo_code = null;

    this.updateCart(this.cart);
  }

  getWrappingCharge(): number {
    return this.wrappingCharge;
  }
  ngOnDestroy() {
    this.subAuthStatusStream.unsubscribe();
    this.subLanguageStream.unsubscribe();
  }

  getCart() {
    // console.log("getCart")
    this.busy = this.cartService.getSubscriberCart().subscribe((result) => {
      window.scrollTo(0, 0);
      this.cart = result.cart;
      this.cart.wrapping_charge = this.wrappingCharge;
      this.cart.discount = this.discount;
      this.cart.promo_id = undefined;
      if (this.cart && this.cart.products && Array.isArray(this.cart.products) && this.cart.products.length > 0) {
        this.updateCart(this.cart);
      }
      this.is_free_shipping = this.cart.products.find(prod => {
        return prod.free_delivery;
      })

      if (this.is_free_shipping) {
        this.deliveryCharge = 0;
      }

      this.similar_product = result.similar_product;

      if (this.cart) {
        this.dataProcess(this.cart)
      }
      else {
        this.hasItemInCart = false;
      }
    })
  }
  updateCart(newData: any) {
    // console.log("updateCart")


    this.busy = this.cartService.updateCart(newData).subscribe((result) => {

      this.cart = result.cart;
      this.is_free_shipping = this.cart.products.find(prod => {
        return prod.free_delivery;
      })
      if (this.promo_code) {
        // console.log("updateCartPromo")

        this.cartService.getPromoCode(this.promo_code).subscribe((res) => {
          this.discount_parcent = res.data.discount;
          this.discount = Math.ceil(this.subTotal * (res.data.discount / 100));
          this.cart.discount = this.discount;
          this.cart.promo_id = res.data._id;
        })
      }

      if (this.is_free_shipping) {
        this.deliveryCharge = 0;
      } else {
        this.deliveryCharge = 40;
      }

      this.similar_product = result.similar_product;
      this.dataProcess(this.cart);
    })
  }


  addCart(item) {
    this.busy = this.cartService.createCart(item).subscribe((result) => {
      if (result.cart && result.cart._id) {
        this.updateCookie("cart_id", result.cart.cart_id, 500).then(cokie => {
          window.scrollTo(0, 0);
          if (this.promo_code) {
            this.cartService.getPromoCode(this.promo_code).subscribe((res) => {
              this.discount_parcent = res.data.discount;
              this.discount = Math.ceil(this.subTotal * (res.data.discount / 100));
              this.cart.discount = this.discount;
              this.cart.promo_id = res.data._id;
            })
          }
          this.cart = result.cart;
          this.similar_product = result.similar_product;
          this.dataProcess(this.cart);
        })
      }
    })
  }

  dataProcess(cartProducts) {
    this.mainTotal = 0;
    this.subTotal = 0;
    let cart = cartProducts;
    let cartItems = cart && cart.products ? cart.products.length : 0;
    if (cartItems === 0) {
      this.hasItemInCart = false;
    } else {
      this.hasItemInCart = true;

      for (let i in cart.products) {
        this.subTotal += (cart.products[i].price) * (cart.products[i].quantity);
        this.mainTotal += (cart.products[i].previous_price) * (cart.products[i].quantity);
      }
      this.disc = this.mainTotal - this.subTotal;


      if ((this.subTotal - this.discount + this.wrappingCharge) >= 500) {
        this.deliveryCharge = 0;
      } else if (((this.subTotal - this.discount + this.wrappingCharge) < 500) && !this.is_free_shipping) {
        this.deliveryCharge = 40;
      }
    }
    this.pubSubService.CartStream.emit({ totalCartItems: cartItems, price: this.getCartPrice(cart.products) })
  }

  getCartPrice(items) {
    let price = 0;
    if (items && Array.isArray(items) && items.length > 0) { items.map(itm => { price += (itm.price * itm.quantity) }); }
    return price;
  }

  increaseQuantity(product, index) {
    product.quantity += 1;
    this.cart.products[index] = product;
    this.updateCart(this.cart);
  }

  decreaseQuantity(product, index) {
    product.quantity -= 1;
    this.cart.products[index] = product;
    this.updateCart(this.cart);
  }

  removeItem(index) {
    this.cart.products.splice(index, 1);
    this.updateCart(this.cart);
  }

  giftWrap() {
    this.cart.wrapping_charge = this.wrappingCharge;
    this.updateCart(this.cart);
  }

  storeCart() {
    if (this.cart.products.length <= 10) {
      window.localStorage.setItem('presentCart', this.cart._id);
      //this.router.navigateByUrl('../shipping');
    }
    else {
      alert("Cart products should be less than or equal 10");
    }

  }

  getSelectedProduct(seo_url) {
    this.router.navigate(['../../../book', seo_url]);
  }

  typed(text, product, index) {
    //var reg = new RegExp('^[0-9]*$');
    var reg = new RegExp('^[1-9]?$|^10$');

    if (reg.test(text) && text) {
      product.quantity = parseInt(text);
      this.cart.products[index] = product;
    }
    else {
      this.cart.products[index].quantity = product.quantity;
    }
  }

  focusOutFunction() {
    this.updateCart(this.cart);
  }

  updateCookie(name, value, days) {
    return new Promise((resolve, reject) => {
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();
      }
      else {
        var expires = "";
      }
      document.cookie = name + "=" + value + expires + "; path=/";
      resolve(true)
    })
  }

}