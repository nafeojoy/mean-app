import { Component } from '@angular/core';
import { ReviewService } from './review.service';
import { ProductService } from '../../../catalog/components/products/products.service';

import "style-loader!./datepick.css"

@Component({
    selector: 'review-list',
    templateUrl: './review.list.html',
    styleUrls: ['./review.scss']
})
export class ReviewListComponent {

    public allreview: any = [];
    public reviewList: any = [];
    public selectedreview: any = {};
    dtRange: any = {};
    waiting: boolean = false;
    // public busy: Subscription;


    public totalItems: number = 0;
    public currentPage: number = 1;
    public maxSize: number = 5;

    public approved: boolean;
    public start_date: Date;
    public end_date: Date;


    constructor(private reviewService: ReviewService, private productService: ProductService) {

    }

    ngOnInit() {
        this.end_date = new Date();
        var date = new Date();
        this.start_date = new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000));
        this.approved = false;

        this.getReviews();
    }

    ngOnDestroy() {
        // this.busy.unsubscribe();
    }

    getReviews() {
        this.waiting = true;
        let params = {
            approved: this.approved,
            start_date: this.start_date,
            end_date: this.end_date,
            currentPage: this.currentPage
        }
        this.reviewService.getAll(params).subscribe(result => {
            this.waiting = false;
            this.reviewList = result.data;
            this.totalItems = result.count;
        })
    }

    selectedStatus() {
        this.getReviews();
    }

    setPage() {
        this.currentPage;
        this.getReviews();
    }

    dateChanged() {
        this.start_date = new Date(this.dtRange[0]);
        this.end_date = new Date(this.dtRange[1]);
        this.getReviews();
    }

    acceptReview(item, index) {
        this.productService.getById(item._id).subscribe(res => {
            item.review_approved_counter = res.review_approved_counter;
            if (item.review_approved_counter < 30) {
                let decission = confirm("Are you sure to accept?")
                if (decission) {
                    this.reviewService.update(item).subscribe(result => {
                        if (result.success) {
                            this.reviewList[index].approved = true;
                            this.getReviews();
                        }
                    })
                }
            } else {
                alert("You can not approve more Reviews for this Book")
            }
        })
    }

    deleteReview(item, index) {
        let decission = confirm("Are you sure to delete?")
        if (decission) {
            this.reviewService.delete(item).subscribe(result => {
                if (result.success) {
                    this.reviewList.splice(index, 1);
                    this.getReviews();
                }
            })
        }
    }

    showViewModal(reviewImages) { }
}