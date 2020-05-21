import { NgModule, ApplicationRef } from '@angular/core';
import { CarouselModule, CarouselComponent, SlideComponent, CarouselConfig } from 'ngx-bootstrap/carousel';
// import { CookieService, CookieOptions } from 'angular2-cookie/core';
import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from "./home.component";
import { HomeService } from "./home.service";
import { ViewAllComponent } from "./components/view-all";
import { JsonpModule } from '@angular/http';

import { SliderComponent } from "./components/slider";

import { TopBlockComponent, TopSlideLoaderComponent } from "./components/top-block";
import { MiddleBlockComponent, MiddleSlideLoaderComponent } from "./components/middle-block";
import { BottomBlockComponent, BottomSlideLoaderComponent } from "./components/bottom-block";

import { CartService } from "./cart.service"
import { TestimonialBlockComponent, TestimonialBlockService } from "./components/testimonial-block";

@NgModule({
  declarations: [
    HomeComponent,
    TopBlockComponent,
    TopSlideLoaderComponent,
    MiddleBlockComponent,
    MiddleSlideLoaderComponent,
    BottomBlockComponent,
    BottomSlideLoaderComponent,
    TestimonialBlockComponent,
    SliderComponent,
    ViewAllComponent
  ],
  imports: [
    SharedModule,
    CarouselModule.forRoot(),
    JsonpModule
  ],
  providers: [
    HomeService, TestimonialBlockService, CartService
  ]
})

export class HomeModule { }
