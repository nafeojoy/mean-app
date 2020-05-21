import { Component, ViewEncapsulation, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TestimonialBlockService } from './testimonial-block.service';
import 'style-loader!./testimonial-block.scss';

@Component({
    selector: 'testimonial-block',
    templateUrl: './testimonial-block.html',
    providers: [TestimonialBlockService],
    encapsulation: ViewEncapsulation.None
})

export class TestimonialBlockComponent {

    public testimonials: any;
    public carouselInterval: number = 2000;
    public noWrapSlides: boolean = false;
    private _items = new BehaviorSubject<any[]>([]);
    public staticImageBaseUrl = this.testimonialBlockService.staticImageBaseUrl;
    @Input()
    set speeches(value) {
        this._items.next(value);
    }

    get speeches() {
        return this._items.getValue();
    }

    constructor(private testimonialBlockService: TestimonialBlockService) { }

    ngOnInit() {
        this._items.subscribe(res => {
            this.testimonials = res;
        })
    }
}