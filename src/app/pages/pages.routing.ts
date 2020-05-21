import { Routes, RouterModule } from '@angular/router';
import { Pages } from './pages.component';
import { ModuleWithProviders } from '@angular/core';
// import {AuthManager} from '../authmanager'
// noinspection TypeScriptValidateTypes
export const routes: Routes = [
  {
    path: 'login',
    loadChildren: 'app/pages/login/login.module#LoginModule'
  },
  {
    path: 'pages',
    component: Pages,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: 'app/pages/home/home.module#HomeModule' },
      { path: 'user-management', loadChildren: 'app/pages/user-management/user-management.module#UserManagementModule' },
      { path: 'catalog', loadChildren: 'app/pages/catalog/catalog.module#CatalogModule' },
      { path: 'seo-update', loadChildren: 'app/pages/seo/seo.module#SeoModule' },
      { path: 'system', loadChildren: 'app/pages/system/system.module#SystemModule' },
      { path: 'promote', loadChildren: 'app/pages/promote/promote.module#PromoteModule' },
      { path: 'sales', loadChildren: 'app/pages/sales/sales.module#SalesModule' },
      { path: 'crm/:phone_number', loadChildren: 'app/pages/crm/crm.module#CrmModule' },
      { path: 'public-site', loadChildren: 'app/pages/public-page/public-page.module#PublicPageModule' },
      { path: 'dynamic-page', loadChildren: 'app/pages/dynamic-page/dynamic-page.module#DynamicPageModule' },
      { path: 'inventory', loadChildren: 'app/pages/inventory/inventory.module#InventoryModule' },
      { path: 'mis-reports', loadChildren: 'app/pages/mis-reports/mis-reports.module#MISReportsModule' },
      { path: 'approval', loadChildren: 'app/pages/approval/approval.module#ApprovalModule' },
      { path: 'miscellaneous', loadChildren: 'app/pages/miscellaneous/miscellaneous.module#MiscellaneousModule' },
      { path: 'expense-entry', loadChildren: 'app/pages/expense-entry/expense.module#ExpenseModule' },
      { path: 'accounts-report', loadChildren: 'app/pages/account-reports/account-reports.module#AccountReportModule' }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
