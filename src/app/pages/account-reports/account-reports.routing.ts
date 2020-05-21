import { Routes, RouterModule } from '@angular/router';

import { AuthManager } from '../../authManager';
import { AccountReportComponent } from './account-reports.component';
import { PurchaseComponent } from './components/purchase/purchase.component';
import { StockComponent } from './components/stock/stock.component';
import { ExpenseComponent } from './components/expense/expense.component';
import { CollectionComponent } from './components/collection/collection.component';


const routes: Routes = [
  {
    path: '',
    component: AccountReportComponent,
    children: [
      { path: 'purchase', component: PurchaseComponent, canActivate: [AuthManager] },
      { path: 'stock', component: StockComponent, canActivate: [AuthManager] },
      { path: 'expense', component: ExpenseComponent, canActivate: [AuthManager] },
      { path: 'collection', component: CollectionComponent, canActivate: [AuthManager] }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
