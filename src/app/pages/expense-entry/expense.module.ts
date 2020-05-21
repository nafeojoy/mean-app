import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, PaginationModule, TabsModule, AlertModule } from "ngx-bootstrap";
import { SimpleNotificationsModule } from 'angular2-notifications';
import { UiSwitchModule } from 'ng2-ui-switch';
import { TreeModule } from 'angular-tree-component';

import { routing } from './expense.routing'
import { NgaModule } from '../../theme/nga.module';
import { AuthManager } from "../../authManager";
import { SharedModule } from '../../shared/shared.module';
import { ExpenseComponent } from "./expense.component";
import {
  ChartOfAccountListComponent,
  ChartOfAccountAddComponent,
  ChartOfAccountService,
  ChartOfAccountEditComponent
} from './chart-of-account';
import {
  VoucherEntryComponent,
  VoucherEntryService
} from './voucher-entry';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    SharedModule,
    routing,
    UiSwitchModule,
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    AlertModule.forRoot(),
    ReactiveFormsModule,
    TreeModule,
    SimpleNotificationsModule
  ],
  declarations: [
    ExpenseComponent,
    ChartOfAccountListComponent,
    ChartOfAccountAddComponent,
    ChartOfAccountEditComponent,
    VoucherEntryComponent
  ],
  providers: [
    AuthManager,
    ChartOfAccountService,
    VoucherEntryService
  ]
})
export class ExpenseModule { }
