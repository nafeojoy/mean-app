import { Component, ViewEncapsulation, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/pluck';
import { CookieService } from 'angular2-cookie/core';
import * as FingerPrint from "fingerprintjs2";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CartService } from '../home/cart.service';

import { HomeService } from './home.service';
import { PubSubService } from '../shared/services/pub-sub-service';
import { CustomCookieService } from '../shared/services';

import { SeoContentLoaderService } from '../shared/services/seoconten-loader.service';

import 'style-loader!./home.scss';

@Component({
    selector: 'home',
    providers: [HomeService],
    templateUrl: './home.html',
    encapsulation: ViewEncapsulation.None
})

export class HomeComponent {
    content: Observable<any> = new Observable<any>();
    private _items = new BehaviorSubject<any[]>([]);
    public inputItems: any;

    topCategorieTab: Observable<any> = new Observable<any>();
    middleCategorieTab: Observable<any> = new Observable<any>();
    bottomCategorieTab: Observable<any> = new Observable<any>();

    speeches: Observable<any> = new Observable<any>();
    banners: Observable<any> = new Observable<any>();
    promotionalImages: Observable<any> = new Observable<any>();

    private subLanguageStream: any;
    private sub: any;

    public order_no: string;
    public is_order_submited: boolean;

    mobWidth: number;
    public products: any = [];
    cart: any;

    constructor(private homeService: HomeService, private pubSubService: PubSubService, private customCookieService: CustomCookieService,
        private _cookieService: CookieService, private route: ActivatedRoute, private router: Router, private seoContentLoaderService: SeoContentLoaderService, private cartService: CartService) {
        let fingerprint = this._cookieService.get('fingerprint');
        this.getFingerPrint()
            .then(result => {
                if (fingerprint) {
                    if (!this.isAllreadyTrackedToday()) {
                        this.recordUserVisit({ isNew: false, fingerprint: fingerprint });
                    }
                } else {
                    this.customCookieService.setCookie('fingerprint', JSON.stringify(result), 500);
                    this.recordUserVisit({ isNew: true, fingerprint: result });
                }
            });
            let tkn=this._cookieService.get('token');
            if(tkn=='ro'){
                this._cookieService.remove('token');
            }
    }

    @Input()
    set arrayItems(value) {
        this._items.next(value);
    }

    get arrayItems() {
        return this._items.getValue();
    }

    isAllreadyTrackedToday() {
        let lastTrackAt = this._cookieService.get('trackingKey');
        return lastTrackAt == this.getSimpleDate() ? true : false;
    }


    getFingerPrint() {
        return new Promise((resolve, reject) => {
            new FingerPrint().get(function (result, components) {
                resolve(result)
            })
        })
    }

    recordUserVisit(info: any) {
        this.getMyExternalIP().then((result: any) => {
            info.ip = result.ip;
            this.homeService.trackUservisit(info).subscribe(result => { })
        })
    }

    getMyExternalIP() {
        return new Promise((resolve, reject) => {
            this.homeService.getExternalIp().subscribe(result => {
                resolve(result)
            })
        })
    }

    getSimpleDate() {
        let today = new Date();
        return today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();
    }

    ngOnInit() {
        this._items.subscribe(res => {
            console.log("_items");
            this.inputItems = res;
            this.getSubscriberCartItems(this.inputItems);
        })
        this.getHomePageContent();
        this.subLanguageStream = this.pubSubService.LanguageStream.subscribe((result) => {
            this._items.subscribe(res => {
                this.inputItems = res;
                this.getSubscriberCartItems(this.inputItems);
            })
            this.getHomePageContent();
        });

        this.sub = this.route
            .queryParams
            .subscribe(params => {
                if (params['login']) {
                    setTimeout(() => {
                        this.pubSubService.AuthStatusStream.emit({ showSignInModal: true })
                    }, 2000)
                }
                if (params['ors']) {
                    this.is_order_submited = true;
                    this.order_no = params['ors'];
                    setTimeout(() => {
                        this.order_no = "";
                        this.is_order_submited = false;
                        this.router.navigate(['/'])
                    }, 5000)
                }
            });
    }

    ngOnDestroy() {
        this.subLanguageStream.unsubscribe();
        this.sub.unsubscribe();
    }


    getHomePageContent() {
        this.content = this.homeService.getPageContent();

        this.topCategorieTab = this.content.pluck<any[], any>('topCategorieTab');
        this.middleCategorieTab = this.content.pluck<any[], any>('middleCategorieTab');
        this.bottomCategorieTab = this.content.pluck<any[], any>('bottomCategorieTab');

        this.speeches = this.content.pluck<any[], any>('testimonial');
        this.banners = this.content.pluck<any[], any>('banners');

        let title = "BoiBazar.Com - Online Book Shop in Bangladesh | Largest online bookstore in Bangladesh | Buy Books Online";
        let meta_tag_title = "BoiBazar.Com - Online Book Shop in Bangladesh | Largest online bookstore in Bangladesh | Buy Books Online";
        let meta_keywords = "Online Book Shop in Bangladesh, Largest online bookstore in Bangladesh, Buy Books Online, Book Shop in Dhaka, Online Book Shop Dhaka, Top five Book Stores in Dhaka";


        this.seoContentLoaderService.setContent(title, meta_tag_title, meta_keywords);
    }

    getSubscriberCartItems(products) {
        this.cartService.getSubscriberCart().subscribe(response => {
            this.mobWidth = (window.screen.width);
            if (this.mobWidth <= 1098) {
                $(".small-check").css("width", "200px");
                $(".small-item").css("width", "180px");
            }
            // console.log(products);
            // console.log(response);
            this.cart = response.cart;

            if (this.cart != null) {
                this.products = products;
                // console.log(this.products);
                let cartItems = this.cart && this.cart.products ? this.cart.products.length : 0;
                this.pubSubService.CartStream.emit({ totalCartItems: cartItems, price: this.getCartPrice(this.cart.products) })
            }
        })
    }
    getCartPrice(items) {
        let price = 0;
        if (items && Array.isArray(items) && items.length > 0) { items.map(itm => { price += (itm.price * itm.quantity) }); }
        return price;
    }
}