import { Component, ViewEncapsulation, Input, ViewChild, HostListener } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DomSanitizer } from "@angular/platform-browser";
import { ModalDirective } from 'ngx-bootstrap';

import { CartService } from '../billing/components/cart/cart.service';
import { PubSubService, } from '../shared/services/pub-sub-service';
import { AuthService, ProductService, SeoContentLoaderService } from '../shared/services';
import { BuyNowDataService } from '../shared/data-services/buy-now-data.service';
import { FilterDataService } from '../shared/data-services/filter-data.service';

import 'style-loader!./product.details.scss';



@Component({
    selector: 'product-detail',
    providers: [CartService],
    templateUrl: './product.details.html',

    // host: { '(window:keydown)': 'keyboardInput($event)' },
    encapsulation: ViewEncapsulation.None
})
// @HostListener('window:keydown', ['$event'])
export class ProductDetailComponent {

    public product: any = {};
    public publisher_seo_url: string = '';
    public breadcrumbData: any = {};
    public matchData: any = {};

    public cart: any = {};
    public cartProductsIndex: number;
    public productSlug: string;
    public related_product: any;
    public requestedCartItem: any;
    public staticImageBaseUrl: string;
    public message: string;
    public ratingData: number = 4.5;
    public busy: Subscription;
    public busyImage: Subscription;

    fbUrl: any;
    private subSearchStream: any;
    private subAuthStatusStream: any;
    private subLanguageStream: any;
    public alerts: any = [];
    private qty = 1;
    private bundleTotal: number = 0;
    private bundlePrevious: number = 0;
    private bundleDiscount: number = 0;
    public saving: number = 0;

    public previewImages: any = [];
    public save_parcent: number;
    public bundle_items: any = {};
    public list_bundle: any = {};
    public bookPageNum: number = 1;
    public checkBookPage: Boolean;
    public bookImageCount: number;
    zoomCheck = 1;
    myInterval = 600000;
    activeSlideIndex = 0;
    images: any = [];
    keyboardEvent;
    disAddToCart: boolean;
    canonicalUrl: any;

    @ViewChild('imageModal') imageModal: ModalDirective;

    constructor(private _cookieService: CookieService, private cartService: CartService, private router: Router,
        private route: ActivatedRoute, private authService: AuthService, private pubSubService: PubSubService,
        private buyNowDataService: BuyNowDataService, private productService: ProductService,
        private seoContentLoaderService: SeoContentLoaderService, private filterDataService: FilterDataService, private domSanitizer: DomSanitizer) {
    }

    ngOnInit() {
        let concated_uri = "https://www.facebook.com/plugins/share_button.php?href=http://m.boibazar.com/book/" + this.route.snapshot.params['slug'] + "&layout=button&size=small&mobile_iframe=false&appId=1764304390530081&width=59&height=20";
        concated_uri = encodeURI(concated_uri);
        this.fbUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(concated_uri);
        this.staticImageBaseUrl = this.productService.staticImageBaseUrl;
        this.setProductSlug();
        this.getProduct(this.productSlug);

        this.subSearchStream = this.pubSubService.SearchStream.subscribe((result) => {
            if (result.search) {
                this.getProduct(result.search);
            }
        });

        this.subAuthStatusStream = this.pubSubService.AuthStatusStream.subscribe((result) => {
            this.setProductSlug();
            if (result.status === false) {
                this.getProduct(this.productSlug);
            }

            if (result.status === true) {
                if (this.requestedCartItem) {
                    this.addToCart(this.requestedCartItem);
                }
                this.getProduct(this.productSlug);
            }
        });

        this.subLanguageStream = this.pubSubService.LanguageStream.subscribe((result) => {
            this.setProductSlug();
            this.getProduct(this.productSlug);
        });


    }

    ngOnDestroy() {
        this.subSearchStream.unsubscribe();
        this.subAuthStatusStream.unsubscribe();
        this.subLanguageStream.unsubscribe();
        this.busy.unsubscribe();
        if (this.busyImage) this.busyImage.unsubscribe();
        //this.breadcrumbData = {};

        this.pubSubService.SearchStream.emit({ searchTextEmpty: true });
    }

    setProductSlug() {
        this.productSlug = this.route.snapshot.params['slug'];
    }

    getProduct(product_slug) {
        this.bundleTotal = 0;
        this.bundlePrevious = 0;
        this.saving = 0;
        this.save_parcent = 0;

        this.busy = this.productService.get(product_slug).subscribe((result) => {
            var previews = result.product.preview_images;

            previews.sort(function (a, b) {
                return a.page_num - b.page_num;
            });

            if (previews.length > 0) {
                this.checkBookPage = true;
                var obj = {};
                for (var i = 0, len = previews.length; i < len; i++)
                    obj[previews[i]['_id']] = previews[i]['image']['1200X1600'];
                previews = new Array();
                for (var key in obj)
                    previews.push(obj[key]);
                this.previewImages = previews;
            } else {
                this.checkBookPage = false;
            }

            this.bundle_items = result.product.bundle_items;
            this.list_bundle = result.product.list_bundle;
            this.product = result.product;

            let canonical = "https://www.boibazar.com/book/" + this.product.seo_url;
            canonical = encodeURI(canonical);
            this.canonicalUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(canonical);

            if (result.product.previous_price && result.product.price) {
                this.save_parcent = Math.ceil(((result.product.previous_price - result.product.price) / result.product.previous_price) * 100);
            }

            this.seoContentLoaderService.setContent(this.product.name, this.product.meta_tag_description, this.product.meta_tag_keywords);

            // this.seoContentLoaderService.setContent(this.product.meta_tag_title, this.product.meta_tag_description, this.product.meta_tag_keywords);
            if (result.product.is_bundle) {
                for (let i in result.product.bundle_items) {
                    this.bundleTotal += (result.product.bundle_items[i].price);
                    if (result.product.bundle_items[i].previous_price) {
                        this.bundlePrevious += (result.product.bundle_items[i].previous_price);
                    }
                    this.saving = this.bundleTotal - result.product.price;
                }
            }
            this.product.quantity = 1;
            this.related_product = result.related_product;
            this.publisher_seo_url = this.product.publisher.seo_url;
            this.getBreadcrumbData();
            window.scrollTo(0, 0);
            this.getSubscriberCartItems();
        });
    }

    getSubscriberCartItems() {
        this.cartService.getSubscriberCart().subscribe(response => {
            this.cart = response.cart;
            if (this.cart) {
                let cartItems = this.cart && this.cart.products ? this.cart.products.length : 0;
                this.pubSubService.CartStream.emit({ totalCartItems: cartItems, price: this.getCartPrice(this.cart.products) })
                this.crossMatching();
            }
        })
    }

    getCartPrice(items) {
        let price = 0;
        if (items && Array.isArray(items) && items.length > 0) { items.map(itm => { price += (itm.price * itm.quantity) }); }
        return price;
    }

    crossMatching() {
        let addedItems = [];

        for (var i in this.cart.products) {
            addedItems.push(this.cart.products[i].product_id);
        }

        let isMatch = addedItems.indexOf(this.product._id)
        if (isMatch > -1) {
            this.cartProductsIndex = isMatch;
            this.product.already_added = true;
            this.product.quantity = this.cart.products[isMatch].quantity;
            this.qty = this.product.quantity;
        }
    }

    addToCart(item) {
        if (!this.disAddToCart) {
            item.products = [{
                product_id: item._id,
                quantity: this.product.quantity,
                free_delivery: item.free_delivery,
                price: item.price,
                previous_price: item.previous_price,
                seo_url: item.seo_url,
                name: item.name,
                image: item.image,
                author: item.author ? item.authors[0].name : 'unknown author',
                publisher: item.publisher ? item.publisher.name : 'unknown publisher'
            }];

            this.disAddToCart = true;
            this.cartService.createCart(item).subscribe((res) => {
                this.disAddToCart = false;

                this.cart = res.cart;
                if (res.cart && res.cart._id) {
                    this.updateCookie("cart_id", res.cart.cart_id, 500).then(cokie => {
                        this.crossMatching();
                        this.requestedCartItem = null;
                        this.pubSubService.CartStream.emit({ add: true, price: this.getCartPrice(res.cart.products) })
                    })
                }
            })
        }

    }


    increaseQuantity() {
        if (this.product.already_added) {
            this.product.quantity += 1;
            this.product.product_id = this.product._id;
            this.cart.products[this.cartProductsIndex] = this.product;
            this.updateCart(this.cart);
        }
        else {
            this.product.quantity += 1;
            this.product.product_id = this.product._id;
            this.cart.products[this.cartProductsIndex] = this.product;
        }
    }

    decreaseQuantity() {
        if (this.product.already_added) {
            this.product.quantity -= 1;
            this.product.product_id = this.product._id;
            this.cart.products[this.cartProductsIndex] = this.product;
            this.updateCart(this.cart);
        }
        else {
            this.product.quantity -= 1;
            this.product.product_id = this.product._id;
            this.cart.products[this.cartProductsIndex] = this.product;
        }

    }

    typed(text) {
        //var reg = new RegExp('^[0-9]*$');
        var reg = new RegExp('^[1-9]?$|^10$');

        if (reg.test(text) && text) {
            if (this.product.already_added) {
                this.product.quantity = parseInt(text);
                this.product.product_id = this.product._id;
                this.cart.products[this.cartProductsIndex] = this.product;
                this.updateCart(this.cart);
            }
        }
        else {
            this.product.quantity = this.qty;
        }
    }

    updateCart(newData: any) {
        this.cartService.updateCart(newData).subscribe((newCart) => {
            this.cart = newCart.cart;
            if (this.cart && this.cart.products && Array.isArray(this.cart.products)) {
                this.pubSubService.CartStream.emit({ price: this.getCartPrice(this.cart.products) })
            }
            this.crossMatching();

        })
    }

    buyNow(item) {
        // if (this.product.already_added) {
        this.router.navigate(['../../billing/cart',]);
        // }

        // else if (this.authService.isLoggedIn()) {
        //     this.addToCart(item);
        //     this.router.navigate(['../../billing/shipping',]);
        // }

        // else {
        //     this.pubSubService.AuthStatusStream.emit({ showSignInModal: true })
        // }
    }

    getBreadcrumbData() {
        this.breadcrumbData = this.filterDataService.breadcrumbData;

        if (!this.breadcrumbData.url) {
            this.breadcrumbData = this.filterDataService.getBreadcrumbData();
        }
        this.MatchBreadcrumbData();
    }

    MatchBreadcrumbData() {

        if (this.breadcrumbData.type == 'category') {
            let match = this.product.categories.find(x => { return x._id == this.breadcrumbData.typeId; });

            if (match) {
                this.matchData.type = 'Category';
                this.matchData.typeName = match.name;
                this.matchData.productName = this.product.name;
                this.matchData.url = this.breadcrumbData.url;
            }
        }

        else if (this.breadcrumbData.type == 'author') {
            let match = this.product.authors.find(x => x._id == this.breadcrumbData.typeId);

            if (match) {
                this.matchData.type = 'Author';
                this.matchData.typeName = match.name;
                this.matchData.productName = this.product.name;
                this.matchData.url = this.breadcrumbData.url;
            }
        }

        else if (this.breadcrumbData.type == 'publisher') {

            this.matchData.type = 'Publisher';
            this.matchData.typeName = this.product.publisher.name;
            this.matchData.productName = this.product.name;
            this.matchData.url = this.breadcrumbData.url;
        }

        else {
            this.matchData.type = 'Category';
            let url = this.product.categories[0].seo_url;
            this.matchData.url = '/category-books/' + url;
            this.matchData.typeName = this.product.categories[0].name;
            this.matchData.productName = this.product.name;
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
    showModal() {
        // this.getPreviewData(this.bookPageNum);
        this.imageModal.show();
    }
    getPreviewData(pagenum) {
        this.busyImage = this.productService.getPreviewImages(this.product._id, pagenum).subscribe(images => {
            if (images.found) {
                this.images = images.image.image;
            }
            this.bookImageCount = images.count;
        })
    }
    rightPreviewData() {
        if (this.bookPageNum < this.bookImageCount) {
            this.bookPageNum++;
            this.getPreviewData(this.bookPageNum);

        }

    }
    leftPreviewData() {
        if (this.bookPageNum > 1) {
            this.bookPageNum--;
            this.getPreviewData(this.bookPageNum);
        }
    }

    imageZoom() {
        if (this.zoomCheck == 1) {
            $("#book-image").css('cursor', 'zoom-out');
            $("#book-image").css('transform', 'scale(' + 1.2 + ')');
            $("#book-image").css('transition', '.5s');
            this.zoomCheck = 1.2;
        } else if (this.zoomCheck == 1.2) {
            $("#book-image").css('cursor', 'zoom-in');
            $("#book-image").css('transform', 'scale(' + 1 + ')');
            $("#book-image").css('transition', '.5s');
            this.zoomCheck = 1;
        }
    }

}
