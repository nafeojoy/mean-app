import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TestimonialListService } from './testimonial-list.service';

import 'style-loader!./testimonial.scss';

@Component({
  selector: 'testimonial-list',
  providers: [TestimonialListService],
  templateUrl: './testimonial-list.html',
  encapsulation: ViewEncapsulation.None
})

export class TestimonialListComponent {

  public testimonials: any = [];
  public totalItems: number;
  public currentPage: number = 1;
  public maxSize: number = 5;

  constructor(private testimonialListService: TestimonialListService, private router: Router) { }

  ngOnInit() {
    let pageNum = 1
    this.testimonialListService.get(pageNum).subscribe(result => {
      this.testimonials = result.data;
      this.totalItems = result.count;
    })
  }


  setPage(): void {
    this.testimonialListService.get(this.currentPage).subscribe(result => {
      this.testimonials = result.data;
      this.totalItems = result.count;
    })
  }

}