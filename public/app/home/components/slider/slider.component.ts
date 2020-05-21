import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Router } from "@angular/router";

import { PubSubService } from '../../../shared/services/pub-sub-service';
import { HomeService } from '../../../home/home.service';
import { AuthService } from '../../../shared/services/auth.service';
import { NavigationEnd } from '@angular/router/src/events';


@Component({
    selector: 'slider',
    providers: [HomeService],
    templateUrl: './slider.html',
    encapsulation: ViewEncapsulation.None
})

export class SliderComponent {


    item: string;
    show: boolean = false;
    sliderImageBaseUrl: string = this.homeService.sliderImageBaseUrl;
    staticImageBaseUrl: string = this.homeService.staticImageBaseUrl;
    public banners: any = [];
    public promotionalImages: any = [];

    myInterval: number = 10000;
    activeSlideIndex: number = 0;
    noWrapSlides: boolean = false;
    myroute: string;
    homePage: boolean = false;
    


    constructor(private homeService: HomeService, private authService: AuthService, private pubSubService: PubSubService, private router: Router) { 

        // router.events
        // .filter((event) => event instanceof NavigationEnd)
        // .map(() => this.router.routerState)
        // .subscribe((event)=> {
        //     this.myroute = event.snapshot.url;

        //     if (this.myroute == '/') {
        //         this.homePage == true;
        //     }
        //     else if (this.myroute == '/?login=true') {
        //         this.homePage == true;


        //     }
        // })
    }

    ngOnInit() {
        this.homeService.getSliderImages().subscribe(result => {
            if (result.success) {
                this.banners = result.banners;
                this.promotionalImages = result.promotionalImages
            }
        })

    }
}
