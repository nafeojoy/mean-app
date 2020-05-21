import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CartService } from '../cart/cart.service';
import { BuyNowDataService } from '../../../shared/data-services/buy-now-data.service';

@Component({
    selector: 'order-summary',
    providers: [CartService],
    templateUrl: './order.summary.html',
    encapsulation: ViewEncapsulation.None
})
export class OrderSummaryComponent {

    public subTotal: number = 0;
    public mainTotal: number = 0;
    public disc: number = 0;

    public deliveryCharge: number = 0;
    public discount: number = 0;
    public total: number = 0;
    public discount_parcent: number = 0;

    public order_summary: any = {};

    public hideCheckOutButton: boolean = false;
    public wrappingCharge: number = 0;


    // @Input()
    // set wrapCharge(value) {
    //     this.wrappingCharge = value;
    // }

    // get wrapCharge() {
    //     return this.wrappingCharge;
    // }

    @Output()
    setPayableAmount: EventEmitter<any> = new EventEmitter();

    constructor(private cartService: CartService, private buyNowDataService: BuyNowDataService) {

    }

    ngOnInit() {
        let data = this.buyNowDataService.dataSource;
        // console.log("ABC"+data);
        let subTotal: number = 0;
        let mainTotal: number = 0;
        this.discount = 0;
        if (data != null) {
            this.subTotal = data.price;
            this.total = this.subTotal + this.deliveryCharge - this.discount + this.wrappingCharge;

            this.order_summary.wrappingCharge = this.wrappingCharge;
            this.order_summary.total_price = this.subTotal;
            this.order_summary.delivery_charge = this.deliveryCharge;
            this.order_summary.discount = this.discount;
            this.order_summary.total = this.total;

            this.setPayableAmount.emit(this.order_summary);
        }
        else {
            this.getCart();
        }

    }

    getCart() {
        this.cartService.getSubscriberCart().subscribe((result) => {
            let cart = result.cart;
            let is_free_shipping = cart.products.find(prod => {
                return prod.free_delivery;
            })

            this.wrappingCharge = result.cart.wrapping_charge;
            this.discount = result.cart.discount;
            // console.log("XYZ: " + result.cart.wrapping_charge);

            if (is_free_shipping) {
                this.deliveryCharge = 0;
            } else {
                this.deliveryCharge = 40;
            }


            let subTotal: number = 0;
            let mainTotal: number = 0;
            //  this.discount = 0;

            if (cart.products.length > 0) {
                for (let i in cart.products) {
                    subTotal += (cart.products[i].price) * (cart.products[i].quantity);
                    mainTotal += (cart.products[i].previous_price) * (cart.products[i].quantity);
                }
            }
            this.subTotal = subTotal;
            this.mainTotal = mainTotal;
            this.disc = this.mainTotal - this.subTotal;


            // Check 500 taka
            if ((this.subTotal - this.discount + this.wrappingCharge) >= 500) {
                this.deliveryCharge = 0;
            } else if (((this.subTotal - this.discount + this.wrappingCharge) < 500) && !is_free_shipping) {
                this.deliveryCharge = 40;
            }

            this.total = this.subTotal + this.deliveryCharge - this.discount + this.wrappingCharge;

            this.order_summary.wrappingCharge = this.wrappingCharge;
            this.order_summary.total_price = this.subTotal;
            this.order_summary.delivery_charge = this.deliveryCharge;
            this.order_summary.discount = this.discount;
            this.order_summary.total = this.total;


            this.setPayableAmount.emit(this.order_summary);
        })
    }
}
