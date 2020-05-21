import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'angular2-cookie/core';

import { PubliserPageService } from './publisher-page.service';
import { PubSubService } from '../shared/services/pub-sub-service';
import { AuthService } from '../shared/services/auth.service';

@Component({
    selector: 'publisher-page',
    templateUrl: './publisher-page.html',
    encapsulation: ViewEncapsulation.None
})
export class PublisherPageComponent {
    public publisher: any = {};
    public books: any = [];
    public showReviewBox: boolean = false;
    public review: any = {};
    public message: string;
    public showMessage: boolean = true;
    public prevReviews: any = [];

    constructor(private authService: AuthService, private pubSubService: PubSubService, private _cookieService: CookieService,
        private publiserPageService: PubliserPageService, private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        let search_text = this.route.snapshot.params['page-text'];
        this.publiserPageService.getPublisher(search_text).subscribe(result => {
            if (result.status) {
                this.publisher = result.data;
                this.prevReviews = result.data.reviews == undefined ? [] : result.data.reviews;
                this.books = result.products;
            } else {
                this.router.navigateByUrl('/');
            }
        })
    }

    viewDetail(product) {
        this.router.navigate(['/book', product.seo_url]);
    }

    showTextArea() {
        if (this.authService.isLoggedIn()) {
            this.showReviewBox = true;
        } else {
            this.pubSubService.AuthStatusStream.emit({ showSignInModal: true })
        }
    }

    save() {
        this.review.publisher_id = this.publisher._id;
        this.publiserPageService.update(this.review).subscribe(result => {
            if (result._id) {
                this.review = {};
                this.showReviewBox = false;
                this.message = "Thanks for your review";
                this.showMessage = false;
                this.prevReviews = result.reviews;
                setTimeout(() => {
                    this.showMessage = true;
                }, 2000);
            } else {
                this.message = "Your login session has expired, Please login again";
                setTimeout(() => {
                    this.showMessage = true;
                }, 2000);
            }
        })
    }
}