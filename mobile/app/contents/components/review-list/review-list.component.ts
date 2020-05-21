import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ReviewListService } from './review-list.service';

@Component({
  selector: 'review-list',
  providers: [ReviewListService],
  templateUrl: './review-list.html',
  encapsulation: ViewEncapsulation.None
})

export class ReviewListComponent {

  public reviews: any = [];
  public totalItems: number;
  public currentPage: number = 1;
  public maxSize: number = 5;

  constructor(private reviewListService: ReviewListService, private router: Router) { }

  ngOnInit() {
    let pageNum = 1
    this.reviewListService.get(pageNum).subscribe(result => {
      this.reviews = result.data;
      this.totalItems = result.count;
    })
  }

  setPage(): void {
    this.reviewListService.get(this.currentPage).subscribe(result => {
      this.reviews = result.data;
      this.totalItems = result.count;
    })
  }

}