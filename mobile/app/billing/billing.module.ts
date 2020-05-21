import { NgModule, ApplicationRef } from '@angular/core';
import { routing } from './billing.routing';
import { AlertModule } from 'ngx-bootstrap/alert';

import { BillingComponent } from "./billing.component";
import { SharedModule } from '../shared/shared.module';

import { NavigatorComponent } from "./components/navigator";
import { ShippingComponent, ShippingService } from "./components/shipping";
import { CartComponent, CartService } from "./components/cart";
import { OrderSummaryComponent } from "./components/order-summary";
import { SimilarProductComponent } from "./components/similar-products";
import { PaymentComponent, PaymentService, MessageService } from "./components/payment";
// import { SimpleNotificationsModule } from 'angular2-notifications';
import { UiSwitchModule } from 'ng2-ui-switch';
import { SpinnerModule } from 'angular2-spinner/dist';


@NgModule({
  declarations: [
    BillingComponent,
    NavigatorComponent,
    ShippingComponent,
    CartComponent,
    SimilarProductComponent,
    PaymentComponent,
    OrderSummaryComponent
  ],
  imports: [
    routing,
    AlertModule.forRoot(),
    // SimpleNotificationsModule,
    UiSwitchModule,
    SharedModule,
    SpinnerModule
  ],
  providers: [
    CartService, ShippingService, PaymentService,MessageService
  ]
})

export class BillingModule { }