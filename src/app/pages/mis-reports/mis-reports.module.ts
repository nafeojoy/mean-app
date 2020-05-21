import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, PaginationModule, AlertModule } from "ng2-bootstrap";
import { NgaModule } from '../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module';
import { TabsModule } from 'ng2-bootstrap';
import { SpinnerModule } from 'angular2-spinner/dist';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { MISReportsComponent } from "./mis-reports.component";
import { VisitorsReportComponent, VisitorsReportService } from "./components/visitors-report";
import { DashboardUIComponent, DashboardService } from './components/dashboard';
import { PublisherListComponent, PublisherService } from './components/publisher-book';
import { KIBReportComponent, KIBService } from './components/kib-report';
import {CustomerListComponent, CustomerListService} from './components/customet-list';
import { routing } from "./mis-reports.routing";
import { OrderAgingComponent, OrderAgingService } from './components/order-aging-report';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        routing,
        ModalModule.forRoot(), PaginationModule.forRoot(), AlertModule.forRoot(),
        SharedModule,
        TabsModule.forRoot(),
        SpinnerModule,
        BsDatepickerModule.forRoot()
    ],
    declarations: [
        MISReportsComponent,
        VisitorsReportComponent,
        DashboardUIComponent,
        PublisherListComponent,
        KIBReportComponent,
        CustomerListComponent,
        OrderAgingComponent
    ],
    providers: [
        VisitorsReportService,
        DashboardService,
        PublisherService,
        KIBService,
        CustomerListService,
        OrderAgingService
    ]
})
export class MISReportsModule { }
