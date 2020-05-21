import { NgModule, ApplicationRef } from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
// import { CookieService, CookieOptions } from 'angular2-cookie/core';
import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from "./home.component";
import { HomeService } from "./home.service";
import { SliderBlockComponent } from "./components/slider-block";
import { MenuSelectorComponent } from "./components/slider-block/menu-selector.component";
import { ViewAllComponent } from "./components/view-all";
import { CartService } from "./cart.service"
// import { UiSwitchModule } from 'angular2-ui-switch';

import { TopBlockComponent, TopSlideLoaderComponent } from "./components/top-block";
import { MiddleBlockComponent, MiddleSlideLoaderComponent } from "./components/middle-block";
import { BottomBlockComponent, BottomSlideLoaderComponent } from "./components/bottom-block";


@NgModule({
  declarations: [
    HomeComponent,
    SliderBlockComponent,
    MenuSelectorComponent,
    TopBlockComponent,
    TopSlideLoaderComponent,
    MiddleBlockComponent,
    MiddleSlideLoaderComponent,
    BottomBlockComponent,
    BottomSlideLoaderComponent,
    ViewAllComponent,
  ],
  imports: [
    SharedModule,
    CarouselModule.forRoot()
  ],
  providers: [
    HomeService,
    CartService
  ]
})

export class HomeModule { }
