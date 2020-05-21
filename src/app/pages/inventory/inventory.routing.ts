import { Routes, RouterModule } from '@angular/router';
import { AuthManager } from '../../authManager';

import { InventoryComponent } from "./inventory.component";
import { PurchaseAcceptComponent } from "./components/purchase-accept/purchase-accept.component";
import { PurchaseAcceptEditComponent } from "./components/purchase-accept/purchase-accept.edit.component";
import { PurchaseAcceptListComponent } from "./components/purchase-accept/purchase-accept.list.component";
import { PurchaseOrderAddComponent, PurchaseOrderEditComponent, PurchaseOrderListComponent, PendingBookListComponent } from "./components/purchase-order";
import { SupplierAddComponent, SupplierEditComponent, SupplierListComponent } from "./components/supplier";
import { GeneralPurchaseComponent } from './components/purchase-accept/general-purchase.component';
import { ProductAnalysisComponent } from './components/product-analysis/product-analysis.component';
import { BreakBundleComponent } from './components/break-bundle/break-bundle.component';


const routes: Routes = [
    {
        path: '',
        component: InventoryComponent,
        children: [
            { path: 'item-purchase', component: PurchaseAcceptListComponent, canActivate: [AuthManager] },
            { path: 'general-purchase', component: GeneralPurchaseComponent, canActivate: [AuthManager]},
            { path: 'item-purchase/add', component: PurchaseAcceptComponent, canActivate: [AuthManager] },
            { path: 'item-purchase/edit/:id', component: PurchaseAcceptEditComponent },

            { path: 'purchase-order', component: PurchaseOrderListComponent, canActivate: [AuthManager] },
            { path: 'purchase-order/add', component: PurchaseOrderAddComponent, canActivate: [AuthManager] },
            { path: 'purchase-order/edit/:id', component: PurchaseOrderEditComponent, canActivate: [AuthManager] },
            { path: 'purchase-order/pending-book-list', component: PendingBookListComponent },

            { path: 'supplier', component: SupplierListComponent, canActivate: [AuthManager] },
            { path: 'supplier/add', component: SupplierAddComponent, canActivate: [AuthManager] },
            { path: 'supplier/edit/:id', component: SupplierEditComponent, canActivate: [AuthManager] },
            { path: 'product-analysis', component: ProductAnalysisComponent, canActivate: [AuthManager] },
            { path: 'break-bundle', component: BreakBundleComponent, canActivate: [AuthManager] },

            { path: 'report', loadChildren: 'app/pages/inventory/components/reports/reports.module#InventoryReportModule' },
        ]
    }
];

export const routing = RouterModule.forChild(routes);
