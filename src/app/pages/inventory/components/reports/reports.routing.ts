import { Routes, RouterModule } from '@angular/router';
import { AuthManager } from '../../../../authManager';

import { InventoryReportsComponent } from "./reports.component"
import { PurchaseHistoryComponent } from "./purchase-report/purchase-history.report.component";
import { OrderSummaryComponent } from "./order-summary/order-summary.report.component";
import { SalesSummaryReportComponent } from "./sales-summary-report/sales-summary.component";
import { InventoryOverviewComponent } from './inventory-overview/inventory-overview.component';
import { SalesInfoReportComponent } from "./sales-info/sales-info.component";
import { CollectionDetailComponent } from './collection-report/collection-detail.component';
import { CollectionComponent } from './collection-report/collection-report.component';
import { StockReportComponent } from './stock-report/stock-report.component';
import { PurchaseRequisitionReportComponent } from './purchase-requisition-report/purchase-requisition-report.component';
import { DailyStockReportComponent } from './daily-stock/daily-stock-report.component';

const routes: Routes = [
    {
        path: '',
        component: InventoryReportsComponent,
        children: [
            { path: 'purchase-report', component: PurchaseHistoryComponent, canActivate: [AuthManager] },
            { path: 'purchase-requisition-report', component: PurchaseRequisitionReportComponent, canActivate: [AuthManager]},
            { path: 'inventory-overview', component: InventoryOverviewComponent, canActivate: [AuthManager] },
            { path: 'order-summary', component: OrderSummaryComponent, canActivate: [AuthManager] },            
            { path: 'sales-report', component: SalesInfoReportComponent, canActivate: [AuthManager] },
            { path: 'sales-report/:detail', component: SalesSummaryReportComponent},
            { path: 'collection-report', component: CollectionComponent, canActivate: [AuthManager] },
            { path: 'collection-report/:detail', component: CollectionDetailComponent},
            { path: 'stock-report', component: StockReportComponent},        
            { path: 'daily-stock-report', component: DailyStockReportComponent}        
        ]
    }
];

export const routing = RouterModule.forChild(routes);
