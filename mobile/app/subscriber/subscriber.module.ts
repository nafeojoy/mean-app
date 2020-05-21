import { NgModule, ApplicationRef } from '@angular/core';
import { PaginationModule } from "ngx-bootstrap";

import { routing } from './subscriber.routing'

import { SubscriberComponent } from "./subscriber.component";
import { SubscriberService } from "./subscriber.service";
import { SharedModule } from '../shared/shared.module';
import { SpinnerModule } from 'angular2-spinner/dist';

import { SubscriberViewComponent, SubscriberViewService } from "./components/subscriber-view";
import { PasswordForgetComponent, PasswordForgetService } from "./components/password-forget";
import { PasswordResetComponent, PasswordResetService } from "./components/password-reset";
// import { NewsListComponent, NewsDetailComponent, NewsService } from "./components/news";


@NgModule({
  declarations: [
    SubscriberComponent,
    SubscriberViewComponent,
    PasswordForgetComponent,
    PasswordResetComponent
  ],
  imports: [
    PaginationModule,
    routing,
    SharedModule,
    SpinnerModule
  ],
  providers: [
    SubscriberService, SubscriberViewService, PasswordForgetService, PasswordResetService
  ]
})

export class SubscriberModule { }