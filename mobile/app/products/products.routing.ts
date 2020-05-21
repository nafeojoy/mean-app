import { Routes, RouterModule } from '@angular/router';
import { AuthManager } from '../authManager';

import { ProductsComponent } from './products.component';

const routes: Routes = [
  {
    path: '', component: ProductsComponent, canActivate: [AuthManager]
  }
];

export const routing = RouterModule.forChild(routes);