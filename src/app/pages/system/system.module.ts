import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, PaginationModule, TabsModule, AlertModule } from "ngx-bootstrap";
import { SimpleNotificationsModule } from 'angular2-notifications';
import { UiSwitchModule } from 'ng2-ui-switch';

import { NgaModule } from '../../theme/nga.module';
import { FilterPipe } from "../../pipes/filter.pipe";
import { AuthManager } from "../../authManager";
import { SharedModule } from '../../shared/shared.module';
import { System } from "./system.component";
import { routing } from "./system.routing";


import { LanguageAddComponent, LanguageEditComponent, LanguageListComponent, LanguageService } from "./components/languages";
import { OfferAddComponent, OfferEditComponent, OfferListComponent, OfferService } from "./components/offers";
import { CurrencyAddComponent, CurrencyEditComponent, CurrencyListComponent, CurrencyService } from "./components/currencies";
import { WeightClassAddComponent, WeightClassEditComponent, WeightClassListComponent, WeightClassService } from "./components/weight-classes";
import { LengthClassAddComponent, LengthClassEditComponent, LengthClassListComponent, LengthClassService } from "./components/length-classes";

import { OrderStatusListComponent, OrderStatusAddComponent, OrderStatusEditComponent, OrderStatusService } from "./components/order-statuses";
import { DirectPayAddComponent, DirectPayEditComponent, DirectPayListComponent, DirectPayService } from './components/direct-pay';
import { OrderCarrierAddComponent, OrderCarrierEditComponent, OrderCarrierListComponent, OrderCarrierService } from "./components/order-carrier";
import { EmployeeAddComponent, EmployeeEditComponent, EmployeeListComponent, EmployeeService } from "./components/employee";
import { GiftAddComponent, GiftEditComponent, GiftListComponent, GiftService } from './components/gift';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    SharedModule,
    routing,
    UiSwitchModule,
    ModalModule.forRoot(), PaginationModule.forRoot(), AlertModule.forRoot(),
    ReactiveFormsModule,
    SimpleNotificationsModule
  ],
  declarations: [
    System,

    LanguageAddComponent,
    LanguageEditComponent,
    LanguageListComponent,

    OfferAddComponent,
    OfferEditComponent,
    OfferListComponent,

    CurrencyAddComponent,
    CurrencyEditComponent,
    CurrencyListComponent,

    WeightClassAddComponent,
    WeightClassEditComponent,
    WeightClassListComponent,

    LengthClassAddComponent,
    LengthClassEditComponent,
    LengthClassListComponent,

    OrderStatusAddComponent,
    OrderStatusEditComponent,
    OrderStatusListComponent,

    DirectPayAddComponent,
    DirectPayEditComponent,
    DirectPayListComponent,

    OrderCarrierAddComponent,
    OrderCarrierEditComponent,
    OrderCarrierListComponent,

    EmployeeAddComponent,
    EmployeeEditComponent,
    EmployeeListComponent,

    GiftAddComponent,
    GiftEditComponent,
    GiftListComponent
  ],
  providers: [
    AuthManager, LanguageService,
    CurrencyService, WeightClassService, LengthClassService, OrderStatusService, OfferService,
    DirectPayService, OrderCarrierService, EmployeeService, GiftService
  ]
})
export class SystemModule { }
