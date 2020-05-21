import { Component, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { ModalDirective } from 'ngx-bootstrap';

import { AuthService } from '../../../shared/services/auth.service';
import { CustomerReviewService } from './customer-review.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'style-loader!./customer-review.scss';

@Component({
    selector: 'customer-review',
    providers: [AuthService],
    templateUrl: './customer-review.html',
    encapsulation: ViewEncapsulation.None
})

export class CustomerReviewComponent {

    private _busy: any;
    public detail_product: any = {};
    user: string;
    reviewCheck: boolean;
    showReviewInModal: boolean;
    reviewLength: number;
    hideRating: boolean;

    @Input()
    set busy(value) {
        this._busy = value;
    }

    get busy() {
        return this._busy;
    }

    private _items = new BehaviorSubject<any[]>([]);

    @Input()
    set product(value) {
        this._items.next(value);
        this.detail_product = this._items.value;
        this.previousReviews = this.detail_product.reviews;
        this.overall_rating = this.detail_product.rating_count;
        this.rating_avg = this.detail_product.rating_avg;
        this.updateView();
    }

    get product() {
        return this._items.getValue();
    }

    @ViewChild('reviewModal') reviewModal: ModalDirective;

    public review: any = {};
    public rate: number;
    public previousReviews: any = [];
    public approved_counter: number;
    public overall_rating: number;
    public rating_avg: number;
    public errorMessage: string;
    private subAuthStatusStream: any;
    public staticImageBaseUrl: string = this.authService.staticImageBaseUrl;
    public star: number = 0;
    constructor(private authService: AuthService, private _cookieService: CookieService,
        private pubSubService: PubSubService, private customerReviewService: CustomerReviewService) {
    }

    ngOnInit() {
        this.subAuthStatusStream = this.pubSubService.AuthStatusStream.subscribe((result) => {
            if (result.status === true && this.showReviewInModal) {
                setTimeout(() => {
                    this.reviewModal.show();
                    this.showReviewInModal = false;
                }, 1000)
            }
        })
    }

    ngOnDestroy() {
        this.subAuthStatusStream.unsubscribe();
    }

    showModal() {
        this.hideRating = false;
        this.review = {};
        if (this.authService.isLoggedIn()) {
            this.reviewModal.show();
        } else {
            this.showReviewInModal = true;
            this.pubSubService.AuthStatusStream.emit({ showSignInModal: true, showReviewInModal: true })
        }
    }

    updateView() {
        this.reviewCheck = false;
        this.approved_counter = this.detail_product.review_approved_counter;
        if (this.previousReviews && Array.isArray(this.previousReviews)) {
            this.user = this.authService.getUserId();
            for (let review of this.previousReviews) {
                if (this.user == review.user_id || this.approved_counter>=10) {
                    this.reviewCheck = true;
                }
            }
        }
    }


    save() {
        if (this.review._id) {
            this.review.rate = this.rate;
            this.review.product_id = this.detail_product._id;
            this.customerReviewService.updateReview(this.review).subscribe(result => {
                // console.log(result);
                this.review = {};
                this.star = 0;
                if (result._id) {
                    this.rate = null;
                    this.previousReviews = result.reviews;
                    this.overall_rating = result.rating_count;
                    this.rating_avg = result.rating_avg;
                    this.reviewLength = result.review_approved_counter;
                    this.updateView();
                    this.reviewModal.hide();
                } else {
                    this.errorMessage = result.message;
                    setTimeout(() => {
                        this.errorMessage = null;
                        this.reviewModal.hide();
                    }, 3000)
                }
            })
            this.reviewModal.hide();
        } else {
            this.review.rate = this.rate || this.rate > 0 ? this.rate : 4;
            this.review.product_id = this.detail_product._id;
            this.customerReviewService.update(this.review).subscribe(result => {
                this.review = {};
                this.star = 0;
                if (result._id) {
                    this.rate = null;
                    this.previousReviews = result.reviews;
                    this.overall_rating = result.rating_count;
                    this.rating_avg = result.rating_avg;
                    this.reviewLength = result.review_approved_counter;
                    this.updateView();
                    this.reviewModal.hide();
                } else {
                    this.errorMessage = result.message;
                    setTimeout(() => {
                        this.errorMessage = null;
                        this.reviewModal.hide();
                    }, 3000)
                }
            })
        }
    }

    rateChosen(rate) {
        this.rate = parseInt(rate);
    }

    showReviewToUpdate(data) {
        this.hideRating = true;
        this.review = data;
        this.star = data.rate;
        this.rate = data.rate;
        this.review.speech = data.review_speech;
        this.reviewModal.show();
    }

}