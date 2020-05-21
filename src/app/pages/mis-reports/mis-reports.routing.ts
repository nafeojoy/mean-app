import { Routes, RouterModule } from '@angular/router';

import { MISReportsComponent } from "./mis-reports.component";
import { VisitorsReportComponent } from "./components/visitors-report";
import { DashboardUIComponent } from './components/dashboard';
import { PublisherListComponent } from './components/publisher-book';
import { KIBReportComponent } from './components/kib-report';
import {CustomerListComponent} from './components/customet-list';


import { AuthManager } from '../../authManager'
import { OrderAgingComponent } from './components/order-aging-report';

const routes: Routes = [
    {
        path: '',
        component: MISReportsComponent,
        children: [
            { path: 'visitors-report', component: VisitorsReportComponent, canActivate: [AuthManager] },
            { path: 'dashboard', component: DashboardUIComponent, canActivate: [AuthManager] },
            { path: 'publisher-books', component: PublisherListComponent, canActivate: [AuthManager] },
            { path: 'customer-list', component: CustomerListComponent, canActivate: [AuthManager] },                        
            { path: 'kpi-report', component: KIBReportComponent, canActivate: [AuthManager] },
            { path: 'order-aging-report', component: OrderAgingComponent, canActivate: [AuthManager] },           
        ]
    }
];

export const routing = RouterModule.forChild(routes);