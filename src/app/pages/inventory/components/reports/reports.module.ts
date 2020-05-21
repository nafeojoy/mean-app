import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch/dist';
import { ModalModule, TypeaheadModule, PaginationModule, AlertModule } from "ng2-bootstrap";
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { NgaModule } from '../../../../theme/nga.module';
import { SharedModule } from '../../../../shared/shared.module';
import { AuthManager } from "../../../../authManager";

import { routing } from "./reports.routing";


import { InventoryReportsComponent } from "./reports.component"
import { PurchaseHistoryComponent } from "./purchase-report/purchase-history.report.component";
import { OrderSummaryComponent } from "./order-summary/order-summary.report.component";
import { SalesReportComponent } from "./sales-report/sales.component";
import { SalesSummaryReportComponent } from "./sales-summary-report/sales-summary.component";
import { SalesInfoReportComponent } from "./sales-info/sales-info.component";
import { InventoryOverviewComponent } from './inventory-overview/inventory-overview.component';

import { ReportService } from './report.service';
import { SpinnerModule } from 'angular2-spinner/dist';
import { CollectionComponent } from './collection-report/collection-report.component';
import { CollectionDetailComponent } from './collection-report/collection-detail.component';
import { StockReportComponent } from './stock-report/stock-report.component';
import { PurchaseRequisitionReportComponent } from './purchase-requisition-report/purchase-requisition-report.component';
import { DailyStockReportComponent } from './daily-stock/daily-stock-report.component';






import { BsDatepickerModule } from 'ngx-bootstrap';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgaModule,
        SharedModule,
        routing,
        ModalModule.forRoot(),
        TypeaheadModule.forRoot(),
        PaginationModule.forRoot(),
        AlertModule.forRoot(),
        UiSwitchModule,
        MultiselectDropdownModule,
        SpinnerModule,
        BsDatepickerModule.forRoot(),
    ],
    declarations: [
        InventoryReportsComponent,
        PurchaseHistoryComponent,
        SalesReportComponent,
        SalesSummaryReportComponent,
        OrderSummaryComponent,
        InventoryOverviewComponent,
        SalesInfoReportComponent,
        CollectionComponent,
        CollectionDetailComponent,
        StockReportComponent,
        PurchaseRequisitionReportComponent,
        DailyStockReportComponent
    ],
    providers: [
        AuthManager,
        ReportService,
    ]
})
export class InventoryReportModule {

}
