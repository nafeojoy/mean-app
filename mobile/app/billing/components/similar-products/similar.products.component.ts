import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';

import { CartService } from '../../../billing/components/cart/cart.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { ProductService } from '../../../shared/services/product.service';

import 'style-loader!./similar.scss';

@Component({
    selector: 'similar-products',
    templateUrl: './similar.products.html',
    encapsulation: ViewEncapsulation.None
})
export class SimilarProductComponent {
    public products: any = [];
    public _busy: any;
    public requestedCartItem: any;

    @Output()
    addCartEvent: EventEmitter<any> = new EventEmitter();

    @Input()
    set similarProduct(value) {
        this.products = value;
    }

    get similarProduct() {
        return this.products;
    }

    @Input()
    set busy(value) {
        this._busy = value;
    }

    get busy() {
        return this._busy;
    }

    constructor(private productService: ProductService, public cartService: CartService,
        private pubSubService: PubSubService, private router: Router) { }

    ngOnInit() { }
  
    addToCart(item, index) {
        item.products = [{
            product_id: item._id,
            free_delivery: item.free_delivery,
            quantity: 1,
            price: item.price,
            previous_price: item.previous_price,
            seo_url: item.seo_url,
            name: item.name,
            image: item.image,
            author: item.authorObj.name,
            publisher: item.publisher ? item.publisher.name : 'unknown publisher'
        }];

        this.addCartEvent.emit(item);
    }

    getSelectedProduct(seo_url) {
        this.router.navigate(['book', seo_url]);
    };

    prev() {
      //  console.log("prev");
    }

    next() {
       // console.log("next");
    }
}