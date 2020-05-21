import { NgModule, ApplicationRef } from '@angular/core';
import { SpinnerModule } from 'angular2-spinner/dist';
import { ReCaptchaModule } from 'angular2-recaptcha';


import { PaginationModule } from "ngx-bootstrap";

import { routing } from './contents.routing'

import { ContentsComponent } from "./contents.component";
import { SharedModule } from '../shared/shared.module';


import { ReviewListComponent, ReviewListService } from "./components/review-list";
import { TestimonialListComponent, TestimonialListService } from "./components/testimonial-list";
import { NewsListComponent, NewsDetailComponent, NewsService } from "./components/news";
import { PurchaseListComponent, PurchaseListService } from "./components/purchase-list";
import { ArticlesListComponent, ArticlesDetailComponent, ArticlesService} from "./components/articles";


@NgModule({
  declarations: [
    ContentsComponent,
    ReviewListComponent,
    TestimonialListComponent,
    NewsListComponent,
    NewsDetailComponent,
    ArticlesListComponent,
    ArticlesDetailComponent,
    PurchaseListComponent
  ],
  imports: [
    PaginationModule,
    routing,
    SharedModule,
    SpinnerModule,
    ReCaptchaModule
  ],
  providers: [
    ReviewListService, TestimonialListService, NewsService, PurchaseListService, ArticlesService
  ]
})

export class ContentsModule { }