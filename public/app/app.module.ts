import { NgModule, ApplicationRef } from '@angular/core';

import { BrowserModule, Title, Meta } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { CookieService, CookieOptions } from 'angular2-cookie/core';
import { UiSwitchModule } from 'ng2-ui-switch';
import { SimpleNotificationsModule } from 'angular2-notifications';

import { ENV_PROVIDERS } from './environment';

// App is our top level component
import { App } from './app.component';
import { routing } from './app.routing';

import { LayoutModule } from './layout/layout.module';
import { HomeModule } from './home/home.module';
import { SharedModule } from './shared/shared.module';
import { PublisherPageComponent } from './publisher-page/publisher-page.component';
import { PubliserPageService } from './publisher-page/publisher-page.service';
import { PubSubService } from './shared/services/pub-sub-service';
// import { ViewAllService } from './view-all/view-all.service';
import { BuyNowDataService } from './shared/data-services/buy-now-data.service';
import { SearchDataService } from './shared/data-services/searched-data.service';
import { FilterDataService } from './shared/data-services/filter-data.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


/*
  `AppModule` is the main entry point into Angular2's bootstraping process
 */

@NgModule({
  bootstrap: [App],
  declarations: [
    App,
    PublisherPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    routing,
    LayoutModule,
    HomeModule,
    SharedModule, 
    
  ],
  providers: [
    ENV_PROVIDERS,
    CookieService,
    Title,
    Meta,
    { provide: CookieOptions, useValue: {} },
    PubliserPageService, BuyNowDataService, SearchDataService, FilterDataService, PubSubService
  ],
  exports: [],
})

export class AppModule { }
