import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TestimonialService } from './testimonial.service';

import 'style-loader!./testimonial.scss';

@Component({
    selector: 'testimonial-list',
    templateUrl: './testimonial.list.html',
})
export class TestimonialListComponent {
    public apiBaseUrl: any;
    public testimonials: any;
    public selectedTestimonial: any;
    public deletingId: string;
    public deletingIndex: any;
    public imazeSize: any;
    public dataModel = "testimonial";

    constructor(private testimonialService: TestimonialService) { }

    ngOnInit() {
        this.apiBaseUrl = this.testimonialService.apiBaseUrl;
        this.testimonialService.getAll().subscribe(result => {
            this.testimonials = result;
        });
    }

    view(selected) {
        this.selectedTestimonial = selected;
    }

    deleteTestimonial(deleteId, index) {
        this.deletingId = deleteId;
        this.deletingIndex = index;
    }

    delete() {
        this.testimonialService.delete(this.deletingId).subscribe(response => {
            this.testimonialService.getAll().subscribe(result => {
                this.testimonials = result;
            });
        })
    }
}