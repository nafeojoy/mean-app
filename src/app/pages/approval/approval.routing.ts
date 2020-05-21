import { Routes, RouterModule } from '@angular/router';
import { ApprovalComponent } from "./approval.component";
import { AuthManager } from '../../authManager';

import { ProductListComponent } from "./components/products";

const routes: Routes = [
  {
    path: '',
    component: ApprovalComponent,
    children: [
      { path: 'product', component: ProductListComponent, canActivate: [AuthManager] }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
