import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { Router, Event, ActivatedRoute, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { CookieService } from 'angular2-cookie/core';
import { NgZone } from '@angular/core';

import { AuthService, ProductService, SeoContentLoaderService } from '../shared/services';
import { CartService } from './cart.service';
import { PubSubService } from '../shared/services/pub-sub-service';
import { FilterDataService } from '../shared/data-services/filter-data.service';
import 'rxjs/add/operator/pairwise';
import 'style-loader!./products.scss';

@Component({
    selector: 'products',
    providers: [CartService, AuthService],
    templateUrl: './products.html',
    encapsulation: ViewEncapsulation.None
})

export class ProductsComponent {
    public products: any = [];
    public filterData: any = [];
    public search_url: string;
    public search_type: string;
    public route_url: string;

    public breadcrumbType: string;
    public checkBoxData: any = {};
    public productSummaryData: any = {};

    public requestedCartItem: any;
    public searchCriteria: any = {};

    public maxSize: number = 5;
    public totalItems: number;
    public showedItems: number;

    public currentPage: number = 1;
    public ratingData: number = 3.5;

    public throttle = 300;
    public scrollDistance = 0;

    public busy: Subscription;
    private subSearchStream: any;
    private subLanguageStream: any;
    private menuItemSelectStream: any;
    public filterCriteria: any = {};
    public scrolPageNum: number = 1;
    Count: number = 0;
    statusText: string = "not reached";
    Math: any;
    disAddToCart: boolean;

    checkEventFire: boolean = false;

    count: number = 0;
    constructor(private route: ActivatedRoute, private productService: ProductService, private router: Router,
        private location: Location, private authService: AuthService, private pubSubService: PubSubService,
        private cartService: CartService, private filterDataService: FilterDataService, private _cookieService: CookieService,
        private seoContentLoaderService: SeoContentLoaderService, lc: NgZone) {
        this.Math = Math;

    }

    ngOnInit() {

        this.search_type = this.route.snapshot.params['type'];
        this.search_url = this.route.snapshot.params['seo_url'];
        this.route_url = this.router.url;

        this.eventFired()
        setTimeout(() => {
            if (!this.checkEventFire) {
                this.firstloadProducts();
            }
        },1000)


    }

    eventFired() {
        this.subSearchStream = this.pubSubService.SearchStream.subscribe((result) => {
            this.checkEventFire = true;

            if (result.filter) {
                this.filterCriteria = {};
                this.products = [];
                this.totalItems = 0;
                this.showedItems = 0;
                this.currentPage = result.filter.pageNum;
                this.filterCriteria = result.filter;
                if (this.isFilterable()) {
                    this.searchProducts(result.filter);
                } else {
                    this.products = [];
                    this.totalItems = 0;
                    this.showedItems = 0;
                    this.search_type = this.search_type;
                    this.search_url = this.search_url;
                    this.loadProducts();
                }
            }
            if (result.search) {
                this.products = [];
                this.totalItems = 0;
                this.showedItems = 0;
                this.search_type = result.search_type;
                this.search_url = result.search;
                this.loadProducts();
            }
        });

        this.subLanguageStream = this.pubSubService.LanguageStream.subscribe((result) => {
            this.products = [];
            this.totalItems = 0;
            this.showedItems = 0;
            this.currentPage = 1;
            this.loadProducts();
        });

    }

    ngOnDestroy() {
        this.subSearchStream.unsubscribe();
        this.subLanguageStream.unsubscribe();
    }

    isFilterable() {
        let status = false;
        Object.keys(this.filterCriteria).map(i => {
            if ((Array.isArray(this.filterCriteria[i]) && this.filterCriteria[i].length > 0) || (this.filterCriteria['price'] && !(isNaN(this.filterCriteria['price'].greater)))) {
                status = true;
            }
        })
        return status;
    }

    loadProducts() {
        // console.log('loadProducts');

        this.getCheckboxData();
        this.busy = this.productService.getQueryResult(this.search_type, this.search_url).subscribe((result) => {
            this.Count = result.count;
            this.breadcrumbType = result.type;
            this.productSummaryData = result.data;
            this.seoContentLoaderService.setContent(this.productSummaryData.meta_tag_title, this.productSummaryData.meta_tag_description, this.productSummaryData.meta_tag_keywords)
            
            this.totalItems = result.count;
            this.showedItems = result.products.length;
            this.filterData = result.filter_data;

            let products = result.products;
            window.scrollTo(0, 0);
            this.getSubscriberCartItems(products);
        })
    }

    firstloadProducts() {
        // console.log("firstloadProducts");
        this.getCheckboxData();
        this.busy = this.productService.getQueryResult(this.search_type, this.search_url).subscribe((result) => {
            this.Count = result.count;
            this.breadcrumbType = result.type;
            this.productSummaryData = result.data;
            this.seoContentLoaderService.setContent(this.productSummaryData.meta_tag_title, this.productSummaryData.meta_tag_description, this.productSummaryData.meta_tag_keywords)
            this.totalItems = result.count;
            this.showedItems = result.products.length;
            this.filterData = result.filter_data;

            let products = result.products;
            window.scrollTo(0, 0);
            this.getSubscriberCartItems(products);
        })
    }

    searchProducts(data) {
        this.getCheckboxData();
        window.scrollTo(0, 0);
        this.loadSearchedProducts(data);
    }

    loadSearchedProducts(data) {
        this.busy = this.productService.searchProducts(data).subscribe((result) => {
            this.totalItems = result.count;
            this.showedItems = this.showedItems + result.items.length;
            let products = result.items;
            this.getSubscriberCartItems(products);
        });
    }

    getSubscriberCartItems(products) {
        this.busy = this.cartService.getSubscriberCart().subscribe(response => {
            let cart = response.cart;
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
                this.products = this.products.concat(products);
                // console.log(this.products.length);
                let cartItems = cart && cart.products ? cart.products.length : 0;
                this.pubSubService.CartStream.emit({ totalCartItems: cartItems, price: this.getCartPrice(cart.products) })
            }

            else {
                this.products = this.products.concat(products);
            }
        })
    }

    getCartItemNewMenuSelect(products) {
        this.cartService.getSubscriberCart().subscribe(response => {
            let cart = response.cart;
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
                let cartItems = cart && cart.products ? cart.products.length : 0;
                this.pubSubService.CartStream.emit({ totalCartItems: cartItems, price: this.getCartPrice(cart.products) })
            }

            else {
                this.products = products;
            }
        })
    }


    addToCart(item, index) {
        // console.log(item);
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
                author: item.authorObj.name,
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
        }
    }

    getCartPrice(items) {
        let price = 0;
        if (items && Array.isArray(items) && items.length > 0) { items.map(itm => { price += (itm.price * itm.quantity) }); }
        return price;
    }

    getSelectedProduct(product) {
        if (this.breadcrumbType == 'category') {
            let url = '/' + this.search_type + '/' + product.categoryObj.seo_url;
            this.filterDataService.setBreadcrumbData(this.breadcrumbType, product.categoryObj._id, url);
        }
        if (this.breadcrumbType == 'author') {
            let url = '/' + this.search_type + '/' + product.authorObj.seo_url;
            this.filterDataService.setBreadcrumbData(this.breadcrumbType, product.authorObj._id, url);
        }
        if (this.breadcrumbType == 'publisher') {
            let url = '/' + this.search_type + '/' + product.publisher.seo_url;
            this.filterDataService.setBreadcrumbData(this.breadcrumbType, product.publisher._id, url);;
        }
    }

    // @HostListener("window:scroll", [])
    // onScroll(): void {
    //     console.log(window.innerHeight);
    //     console.log(window.scrollY);
    //     console.log(document.body.offsetHeight);
    //     // console.log(window.innerHeight);

    //     if ((window.innerHeight + window.scrollY + 300) >= document.body.offsetHeight && this.totalItems > this.showedItems) {
    //         this.currentPage = this.currentPage + 1;
    //         let hasFilterParam = false;
    //         window.scrollTo(0, (window.scrollY - 100));
    //         this.getOnScrollData(this.currentPage, hasFilterParam)
    //     }
    // }

    viewMoreBtn() {
        this.currentPage = this.currentPage + 1;
        let hasFilterParam = false;
        // window.scrollTo(0, (window.scrollY - 100));
        this.getOnScrollData(this.currentPage, hasFilterParam)
    }
    getOnScrollData(currentPage, hasFilterParam) {
        Object.keys(this.filterCriteria).map(i => {
            if ((Array.isArray(this.filterCriteria[i]) && this.filterCriteria[i].length > 0) || (this.filterCriteria['price'] && !(isNaN(this.filterCriteria['price'].greater)))) {
                hasFilterParam = true;
            }
        })

        if (hasFilterParam) {
            this.searchCriteria = this.filterCriteria;
            this.searchCriteria['pageNum'] = this.currentPage;
            this.loadSearchedProducts(this.searchCriteria);
        } else {
            this.busy = this.productService.getOnScrolData(this.search_type, this.search_url, this.currentPage).subscribe(result => {
                this.totalItems = result.totalProduct;
                this.showedItems = this.showedItems + result.products.length;
                let products = result.products;
                this.getSubscriberCartItems(products);
            })
        }

    }


    getCheckboxData() {
        this.checkBoxData = this.filterDataService.checkBoxData;
        if (!this.checkBoxData.type) {
            this.checkBoxData = this.filterDataService.getCheckBoxData();
        }
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