import { Component, ViewEncapsulation, Input } from '@angular/core';

import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CartService } from '../../cart.service'
import { HomeService } from '../../../home/home.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';

@Component({
    selector: 'bottom-slide-loader',
    templateUrl: './bottom-slide-loader.html',
    encapsulation: ViewEncapsulation.None
})

export class BottomSlideLoaderComponent {

    @Input() public nextRoute: string;
    @Input() public loadUrl: string;
    @Input() public urlParams: string;
    @Input() public imageField: string;
    @Input() public errorImage: string;

    public cartItem: any;
    private _cartItems = new BehaviorSubject<any>([]);

    @Input()
    set cartItems(value) {
        if (value && value != undefined) {
            this._cartItems.next(value);
        }
    }
    get cartItems() {
        return this._cartItems;
    }


    busy: Subscription;
    public inputItems: any;
    private _items = new BehaviorSubject<any[]>([]);
    private pageSubject: Subject<any[]> = new Subject<any[]>();

    public currentPage = 1;
    public checkCurrentPage = 8;
    public requestUrl: string;

    screenSize: string;

    mobHeight: any;
    mobWidth: any;
    Math: any;
    public save_parcent: number;

    public requestedCartItem: any;
    gifshow: boolean = false;
    gifProductId: string;

    public products: any = [];
    disAddToCart: boolean;

    constructor(public homeService: HomeService, private pubSubService: PubSubService, private cartService: CartService) {
        this.Math = Math;

        this.mobHeight = (window.screen.height);
        this.mobWidth = (window.screen.width);

        if (this.mobWidth < 360) {
            this.screenSize = "col-12 col-md-3 mn_hightf_small";
        }
        else {
            if (this.mobWidth == 412) {
                this.screenSize = "col-12 col-md-3 mn_hightf_412";
            } else {
                this.screenSize = "col-12 col-md-3 mn_hightf";

            }
        }
        // console.log(this.mobHeight);
        // console.log(this.mobWidth)
    }

    @Input()
    set arrayItems(value) {
        this._items.next(value);
    }

    get arrayItems() {
        return this._items.getValue();
    }

    ngOnInit() {

        this._items.subscribe(res => {
            this.inputItems = res;
            this.getSubscriberCartItems(this.inputItems);
        })

        this.pageSubject.subscribe(res => {
            if (res.length) {
                this.inputItems = res;
                this.getSubscriberCartItems(this.inputItems);
            }
        });
    }

    next() {
        this.requestUrl = this.loadUrl;

        if (this.urlParams) {
            this.requestUrl = this.loadUrl + '/' + this.urlParams;
        }
        if (this.checkCurrentPage >= 8) {
            this.currentPage = this.currentPage + 1;
            this.getPageContent();
        }
    }

    prev() {
        this.requestUrl = this.loadUrl;

        if (this.urlParams) {
            this.requestUrl = this.loadUrl + '/' + this.urlParams;
        }

        if (this.currentPage > 1) {
            this.currentPage = this.currentPage - 1;
            this.getPageContent();
        }
    }

    getPageContent() {
        this.busy = this.homeService.gotoPage(this.requestUrl, this.currentPage).subscribe(res => {
            this.pageSubject.next(res);
            this.checkCurrentPage = Object.keys(res).length;
            // console.log("getPageContent2:"+  this.checkCurrentPage);

        });
    }

    addToCart(item, index) {
        if (!this.disAddToCart) {
            item.products = [{
                product_id: item._id,
                quantity: 1,
                free_delivery: item.free_delivery,
                price: item.price,
                previous_price: item.previous_price,
                seo_url: item.seo_url,
                name: item.name,
                image: item.image,
                author: item.author.name,
                publisher: item.publisher ? item.publisher.name : 'unknown publisher'
            }];

            this.disAddToCart = true;
            this.cartService.createCart(item).subscribe((res) => {
                this.disAddToCart = false;
                if (res.cart && res.cart._id) {
                    this.updateCookie("cart_id", res.cart.cart_id, 500).then(cokie => {
                        item.already_added = true;
                        this.requestedCartItem = null;
                        this.pubSubService.CartStream.emit({ add: true, price: this.getCartPrice(res.cart.products) })
                    })

                }
            })

            this.showAddGif(item._id);
        }
        // console.log(item.products);

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
    getCartPrice(items) {
        let price = 0;
        if (items && Array.isArray(items) && items.length > 0) { items.map(itm => { price += (itm.price * itm.quantity) }); }
        return price;
    }


    getSubscriberCartItems(products) {
        this.mobWidth = (window.screen.width);
        if (this.mobWidth <= 1098) {
            $(".small-check").css("width", "200px");
            $(".small-item").css("width", "180px");
        }
        this._cartItems.subscribe(res => {
            if (res && res != undefined && res.length != 0) {
                this.cartItem = res;
                let cart = this.cartItem;
                // console.log('b' + cart)
                let addedItems = [];

                if (cart != null) {
                    for (var i in cart.products) {
                        addedItems.push(cart.products[i].product_id);
                    }
                    for (var i in products) {
                        let isMatch = addedItems.indexOf(products[i]._id);
                        if (isMatch > -1) {
                            products[i].already_added = true;
                        }
                    }
                    this.products = products;
                }

                else {
                    this.products = this.products.concat(products);
                }
            }
        })
    }

    showAddGif(id) {
        // var that = this; // no need of this line
        this.gifProductId = id;
        // console.log(this.gifProductId);
        this.gifshow = true;
        setTimeout(() => {    //<<<---    using ()=> syntax
            this.gifshow = false;
        }, 2000);
    }
}