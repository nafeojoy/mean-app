import { Input, Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

import { CartService } from '../../../billing/components/cart/cart.service'
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { AuthService } from '../../../shared/services/auth.service';

import 'style-loader!./cart.scss';

@Component({
    selector: 'cart-count',
    templateUrl: './cart-count.html',
    encapsulation: ViewEncapsulation.None
})

export class CartCountComponent {
    public cartItems: number = 0;
    public isLoggedIn: boolean = false;
    private authStatusStream: any;
    private subCartStream: any;
    public route_url: string;
    cartRoute: string;


    constructor(private pubSubService: PubSubService, private route: ActivatedRoute,
        private cartService: CartService, private router: Router, private location: Location) {
    }

    ngOnInit() {


        this.getCart();

        this.authStatusStream = this.pubSubService.AuthStatusStream.subscribe((result) => {
            this.getCart();
        });

        this.subCartStream = this.pubSubService.CartStream.subscribe((result) => {
            if (result.totalCartItems >= 0) {
                this.cartItems = result.totalCartItems;
            }
            if (result.add) {
                this.cartItems++
            }
            if (result.remove) {
                this.cartItems--
            }
            if (result.paymentCompelete) {
                this.cartItems = 0;
            }
        })

    }

    ngOnDestroy() {
        // this.authStatusStream.unsubscribe();
        this.subCartStream.unsubscribe();
    }

    getCart() {
        this.cartService.getSubscriberCart().subscribe(result => {
            this.cartItems = result.cart && result.cart.products ? result.cart.products.length : 0;
        })
    }

    showCart() {
        // if (this.authService.isLoggedIn() === true) {
        this.router.navigateByUrl('/billing/cart');
        // } else {
        // this.pubSubService.AuthStatusStream.emit({ showSignInModal: true, goToCartIfLogIn: true })
        // }
    }
}