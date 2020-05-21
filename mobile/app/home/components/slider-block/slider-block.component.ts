import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Router } from "@angular/router";
import { CookieService } from 'angular2-cookie/core';
import { HomeService } from '../../../home/home.service';

@Component({
    selector: 'slider-block',
    providers: [HomeService],
    templateUrl: './slider-block.html',
    encapsulation: ViewEncapsulation.None
})

export class SliderBlockComponent {

    @Input() public categories: Observable<any[]>;
    @Input() public authors: Observable<any[]>;
    @Input() public publishers: Observable<any[]>;

    private _banners = new BehaviorSubject<any[]>([]);
    public bannerData: any;

    item: string;
    show: boolean = false;
    public viewMenu: boolean;
    public promotionalImages: any = [];
    sliderImageBaseUrl: string = this.homeService.sliderImageBaseUrl;
    staticImageBaseUrl: string = this.homeService.staticImageBaseUrl;

    myInterval: number = 10000;
    slides: any[] = [];
    activeSlideIndex: number = 0;
    noWrapSlides: boolean = false;

    @Input()
    set banners(value) {
        this._banners.next(value);
    }

    get banners() {
        return this._banners.getValue();
    }

    constructor(public homeService: HomeService, private router: Router, private _cookieService: CookieService) {
        let device = this._cookieService.get('deviceName');
        if (device == 'desktop') {
            this.viewMenu = true;
        }
    }

    ngOnInit() {
        this._banners.subscribe(res => {
            this.bannerData = res;
        })
    }

    over(type) {
        this.show = true;
        this.item = type;
    }

    leave(type) {
        this.show = false;
    }

    showReviews() {
        this.router.navigateByUrl('/contents/review-list');
    }
}