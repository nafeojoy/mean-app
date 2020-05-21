import { Routes, RouterModule } from '@angular/router';
import { AuthManager } from '../../authManager'
import { ExpenseComponent } from './expense.component';
import {
  ChartOfAccountListComponent,
  ChartOfAccountAddComponent,
  ChartOfAccountEditComponent
} from './chart-of-account';
import { VoucherEntryComponent } from './voucher-entry/voucher-entry.component';

const routes: Routes = [
  {
    path: '',
    component: ExpenseComponent,
    children: [
      { path: 'chart-of-account-list', component: ChartOfAccountListComponent, canActivate: [AuthManager] },
      { path: 'chart-of-account-list/add', component: ChartOfAccountAddComponent, canActivate: [AuthManager] },
      { path: 'chart-of-account-list/edit/:id', component: ChartOfAccountEditComponent, canActivate: [AuthManager] },

      { path: 'voucher-entry', component: VoucherEntryComponent, canActivate: [AuthManager] }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
