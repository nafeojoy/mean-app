import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module';
import { routing } from "./account-reports.routing";
import { ModalModule, BsDatepickerModule } from "ngx-bootstrap";
import { AuthManager } from "../../authManager";
import { SpinnerModule } from 'angular2-spinner/dist';

import { AccountReportComponent } from './account-reports.component';
import { PurchaseComponent } from './components/purchase/purchase.component';
import { StockComponent } from './components/stock/stock.component';
import { ExpenseComponent } from './components/expense/expense.component';
import { CollectionComponent } from './components/collection/collection.component';
import { AccountReportService } from './account-report.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule,
    SharedModule,
    routing,
    ModalModule.forRoot(),
    SpinnerModule,
    BsDatepickerModule.forRoot(),
  ],
  declarations: [
    AccountReportComponent,
    PurchaseComponent,
    StockComponent,
    CollectionComponent,
    ExpenseComponent
  ],
  providers: [
    AuthManager,
    AccountReportService
  ]
})
export class AccountReportModule {

}
